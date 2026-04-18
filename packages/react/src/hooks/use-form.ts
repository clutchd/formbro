"use client";

import { type CompiledForm, compile } from "@formbro/core/compile";
import {
  type FormAction,
  type FormInput,
  type FormOnError,
  type FormOnMutate,
  type FormOnSuccess,
  type FormValues,
} from "@formbro/core/schema/form";
import { useCallback, useMemo } from "react";
import { buildListeners } from "../utils/build-listeners";
import { buildValidators } from "../utils/build-validators";
import { useAppForm } from "./tanstack";

function stringifyValues<T extends FormInput>(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, String(item)]),
  ) as FormValues<T>;
}

export type UseFormInstrumentation<T extends FormInput = FormInput, TData = unknown> = {
  onSubmitStart?: ({ form, values }: { form: CompiledForm; values: FormValues<T> }) => void;
  onSubmitSuccess?: ({
    form,
    values,
    data,
  }: {
    form: CompiledForm;
    values: FormValues<T>;
    data: TData;
  }) => void;
  onSubmitError?: ({
    form,
    values,
    error,
  }: {
    form: CompiledForm;
    values: FormValues<T>;
    error: unknown;
  }) => void;
};

export function useForm<T extends FormInput = FormInput, TData = unknown>({
  schema,
  action,
  onMutate,
  onSuccess,
  onError,
  instrumentation,
  disabled = false,
  preview = false,
  debug = false,
}: {
  schema: T;
  action?: FormAction<T, TData>;
  onMutate?: FormOnMutate<T>;
  onSuccess?: FormOnSuccess<T, TData>;
  onError?: FormOnError<T>;
  instrumentation?: UseFormInstrumentation<T, TData>;
  disabled?: boolean;
  preview?: boolean;
  debug?: boolean;
}) {
  if (debug) {
    console.time("useForm");
  }

  const compiled = useMemo(() => compile(schema), [schema]);

  const tanstack = useAppForm({
    defaultValues: compiled.defaults,
    onSubmit: async ({ value }) => {
      if (disabled || preview) {
        return;
      }

      const stringValues = stringifyValues<T>(value);

      try {
        instrumentation?.onSubmitStart?.({ form: compiled, values: stringValues });
        const mutatedValues = onMutate ? onMutate({ values: stringValues }) : stringValues;
        const data = action ? await action({ values: mutatedValues }) : undefined;
        instrumentation?.onSubmitSuccess?.({
          form: compiled,
          values: stringValues,
          data: data as TData,
        });
        onSuccess?.({ result: stringValues, data: data as TData });
      } catch (error) {
        instrumentation?.onSubmitError?.({
          form: compiled,
          values: stringValues,
          error,
        });
        onError?.({ error });
      }
    },
  });

  const listeners = useMemo(() => {
    return buildListeners(tanstack, compiled.listeners);
  }, [compiled.listeners, tanstack]);

  const validators = useMemo(() => {
    return buildValidators(compiled.validators);
  }, [compiled.validators]);

  const validateField = useCallback(
    async (elementId: string) => {
      const events = compiled.events.get(elementId) || ["submit"];

      return Promise.all(
        events.map((cause) => {
          return tanstack.validateField(elementId, cause);
        }),
      );
    },
    [compiled.events, tanstack],
  );

  if (debug) {
    console.timeEnd("useForm");
  }

  const validatePage = useCallback(
    async (pageIndex: number) => {
      console.time("validatePage");
      const page = compiled.pages[pageIndex];
      if (!page) {
        return false;
      }
      await Promise.all(page.fieldIds.map((fieldId) => validateField(fieldId)));
      const valid = page.fieldIds.every((fieldId) => {
        const fieldMeta = tanstack.state.fieldMeta[fieldId];
        return !fieldMeta?.errors || fieldMeta.errors.length === 0;
      });
      console.timeEnd("validatePage");
      return valid;
    },
    [compiled.pages, validateField, tanstack.state.fieldMeta],
  );

  const validate = useCallback(async () => {
    console.time("validate");
    for (let i = 0; i < compiled.pages.length; i++) {
      const valid = await validatePage(i);
      if (!valid) {
        console.timeEnd("validate");
        return false;
      }
    }
    console.timeEnd("validate");
    return true;
  }, [validatePage, compiled.pages]);

  return {
    listeners,
    validators,
    tanstack,
    schema: compiled,
    validatePage,
    validate,
  };
}

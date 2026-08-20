"use client";

import { type CompiledForm, compile } from "@formbro/core/compile";
import { normalizeSubmissionValues } from "@formbro/core/normalization";
import {
  type FormAction,
  type FormInput,
  type FormOnError,
  type FormOnMutate,
  type FormOnSuccess,
  type FormValues,
} from "@formbro/core/schema/form";
import { buildValidators } from "@formbro/core/validation";
import { useCallback, useMemo } from "react";
import { buildListeners } from "../utils/build-listeners";
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
  action,
  compiledSchema,
  onMutate,
  onSuccess,
  onError,
  instrumentation,
  disabled = false,
  preview = false,
  schema,
}: {
  action?: FormAction<T, TData>;
  compiledSchema?: CompiledForm;
  onMutate?: FormOnMutate<T>;
  onSuccess?: FormOnSuccess<T, TData>;
  onError?: FormOnError<T>;
  instrumentation?: UseFormInstrumentation<T, TData>;
  disabled?: boolean;
  preview?: boolean;
  schema?: T;
}) {
  const compiled = useMemo(() => {
    if (compiledSchema) return compiledSchema;
    if (!schema) throw new Error("Form schema is required");
    return compile(schema);
  }, [compiledSchema, schema]);

  const tanstack = useAppForm({
    defaultValues: compiled.defaults,
    onSubmit: async ({ value }) => {
      if (disabled || preview) {
        return;
      }

      if (!action) {
        return;
      }

      const stringValues = stringifyValues<T>(normalizeSubmissionValues(compiled, value));

      try {
        instrumentation?.onSubmitStart?.({ form: compiled, values: stringValues });
        const mutatedValues = onMutate ? onMutate({ values: stringValues }) : stringValues;
        const result = await action({ values: mutatedValues });

        if (!result.ok) {
          const error = "error" in result ? result.error : result;

          instrumentation?.onSubmitError?.({
            form: compiled,
            values: stringValues,
            error,
          });
          onError?.({ error });
          return;
        }

        const data = result.data;

        instrumentation?.onSubmitSuccess?.({
          form: compiled,
          values: stringValues,
          data,
        });
        onSuccess?.({ result: stringValues, data });
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

  const validatePage = useCallback(
    async (pageIndex: number) => {
      const page = compiled.pages[pageIndex];
      if (!page) {
        return false;
      }
      await Promise.all(page.fieldIds.map((fieldId) => validateField(fieldId)));
      const valid = page.fieldIds.every((fieldId) => {
        const fieldMeta = tanstack.state.fieldMeta[fieldId];
        return !fieldMeta?.errors || fieldMeta.errors.length === 0;
      });
      return valid;
    },
    [compiled.pages, validateField, tanstack.state.fieldMeta],
  );

  const validate = useCallback(async () => {
    const results = await Promise.all(
      compiled.pages.map((_, pageIndex) => validatePage(pageIndex)),
    );
    const valid = results.every(Boolean);
    return valid;
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

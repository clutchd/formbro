"use client";

import type { CompiledForm } from "@formbro/core/compile";
import type {
  FormAction,
  FormInput,
  FormOnError,
  FormOnMutate,
  FormOnSuccess,
} from "@formbro/core/schema/form";
import * as React from "react";
import { useEffect, useState } from "react";
import { type UseFormInstrumentation, useForm } from "../hooks/use-form.js";
import { cx } from "../utils/cx.js";
import { Page } from "./page.js";
import { Button, Progress } from "./primitives.js";

export type FormProps<T extends FormInput = FormInput, TData = unknown> = {
  schema: T;
  compiledSchema?: never;
  className?: string;
  action?: FormAction<T, TData>;
  onMutate?: FormOnMutate<T>;
  onSuccess?: FormOnSuccess<T, TData>;
  onError?: FormOnError<T>;
  instrumentation?: UseFormInstrumentation<T, TData>;
  onPercentChange?: (percent: number) => void;
  disabled?: boolean;
  preview?: boolean;
  debug?: boolean;
  children?: (formState: ReturnType<typeof useForm<T, TData>>) => React.ReactNode;
};

export type CompiledFormProps<TData = unknown> = Omit<
  FormProps<FormInput, TData>,
  "children" | "compiledSchema" | "schema"
> & {
  children?: (formState: ReturnType<typeof useForm<FormInput, TData>>) => React.ReactNode;
  compiledSchema: CompiledForm;
  schema?: never;
};

export function Form<T extends FormInput = FormInput, TData = unknown>({
  action,
  compiledSchema,
  onMutate,
  onSuccess,
  onError,
  instrumentation,
  disabled,
  preview,
  className,
  debug = false,
  children,
  onPercentChange,
  schema,
  ...props
}: FormProps<T, TData> | CompiledFormProps<TData>) {
  if (!schema && !compiledSchema) {
    throw new Error("Form schema is required");
  }

  const state = useForm<T, TData>({
    action: action as FormAction<T, TData> | undefined,
    compiledSchema,
    onMutate: onMutate as FormOnMutate<T> | undefined,
    onSuccess: onSuccess as FormOnSuccess<T, TData> | undefined,
    onError: onError as FormOnError<T> | undefined,
    instrumentation: instrumentation as UseFormInstrumentation<T, TData> | undefined,
    disabled,
    preview,
    schema,
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [previewValidationStatus, setPreviewValidationStatus] = useState<
    "invalid" | "valid" | null
  >(null);

  const isMultiPage = state.schema.pages.length > 1;
  const currentPage = state.schema.pages[currentPageIndex];
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === state.schema.pages.length - 1;
  const computePercent = (pageIndex: number) =>
    state.schema.pages.length > 1
      ? Math.round((pageIndex / (state.schema.pages.length - 1)) * 100)
      : 0;
  const percent = computePercent(currentPageIndex);

  useEffect(() => {
    setPreviewValidationStatus(null);
  }, [state.schema]);

  const setPageIndex = (next: number) => {
    setCurrentPageIndex(next);
    onPercentChange?.(computePercent(next));
  };

  if (!currentPage) {
    throw new Error("Page not found");
  }

  const handleNext = async () => {
    if (disabled) {
      return;
    }

    const valid = await state.validatePage(currentPageIndex);

    if (valid && !isLastPage) {
      setPageIndex(currentPageIndex + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstPage) setPageIndex(currentPageIndex - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (disabled) {
      return;
    }

    const valid = await state.validate();

    if (preview) {
      setPreviewValidationStatus(valid ? "valid" : "invalid");
      return;
    }

    if (valid) {
      void state.tanstack.handleSubmit();
    }
  };

  const submitArea = (
    <FormSubmitArea previewValidationStatus={previewValidationStatus} preview={preview}>
      <state.tanstack.SubmitButton schema={state.schema} disabled={disabled} />
    </FormSubmitArea>
  );

  return (
    <form onSubmit={handleSubmit} className={cx("text-wrap", className)} {...props}>
      <state.tanstack.AppForm>
        <Page
          tanstack={state.tanstack}
          listeners={state.listeners}
          validators={state.validators}
          page={currentPage}
        />
        {isMultiPage ? (
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={isFirstPage}
              className={cx(
                "cursor-pointer transition-opacity",
                isFirstPage && "pointer-events-none opacity-0!",
              )}
            >
              <span aria-hidden="true">{"<"}</span>
              <span>Back</span>
            </Button>
            <div className="flex-1" />
            {!isLastPage ? (
              <Button type="button" onClick={handleNext} className="cursor-pointer">
                <span>Continue</span>
                <span aria-hidden="true">{">"}</span>
              </Button>
            ) : (
              submitArea
            )}
          </div>
        ) : (
          submitArea
        )}
      </state.tanstack.AppForm>

      {children?.(state)}

      {isMultiPage && !onPercentChange ? (
        <div className="pt-5 pb-1">
          <Progress className="h-1" value={percent} />
        </div>
      ) : null}

      {debug && <pre>{JSON.stringify(state.tanstack.state, null, 2)}</pre>}
    </form>
  );
}

function FormSubmitArea({
  children,
  preview,
  previewValidationStatus,
}: {
  children: React.ReactNode;
  preview?: boolean;
  previewValidationStatus: "invalid" | "valid" | null;
}) {
  return (
    <div className="space-y-2">
      {preview && previewValidationStatus ? (
        <div
          className={cx(
            "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
            previewValidationStatus === "valid"
              ? "border-green-300 bg-green-50 text-green-950"
              : "border-red-300 bg-red-50 text-red-950",
          )}
          aria-live="polite"
        >
          <span aria-hidden="true" className="shrink-0">
            {previewValidationStatus === "valid" ? "OK" : "!"}
          </span>
          <span className="font-medium">
            {previewValidationStatus === "valid"
              ? "Preview validation passed."
              : "Check the highlighted fields."}
          </span>
        </div>
      ) : null}
      {children}
    </div>
  );
}

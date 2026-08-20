"use client";

import type { CompiledForm } from "@formbro/core/compile";
import type {
  FormAction,
  FormInput,
  FormOnError,
  FormOnMutate,
  FormOnSuccess,
} from "@formbro/core/schema/form";
import { twx } from "@formbro/shared/twx";
import { Alert, AlertDescription, AlertTitle } from "@formbro/ui/alert";
import { Button } from "@formbro/ui/button";
import { Progress } from "@formbro/ui/progress";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
} from "@remixicon/react";
import * as React from "react";
import { useEffect, useState } from "react";
import type { TanStackForm } from "../hooks/tanstack";
import { type UseFormInstrumentation, useForm } from "../hooks/use-form";
import { Page } from "./page";

export type { TanStackForm } from "../hooks/tanstack";

export type FormProps<T extends FormInput = FormInput, TData = unknown> = {
  schema: T;
  compiledSchema?: never;
  className?: string;
  action?: FormAction<T, TData, TanStackForm>;
  onMutate?: FormOnMutate<T, TanStackForm>;
  onSuccess?: FormOnSuccess<T, TData, TanStackForm>;
  onError?: FormOnError<T, TanStackForm>;
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
    action: action as FormAction<T, TData, TanStackForm> | undefined,
    compiledSchema,
    onMutate: onMutate as FormOnMutate<T, TanStackForm> | undefined,
    onSuccess: onSuccess as FormOnSuccess<T, TData, TanStackForm> | undefined,
    onError: onError as FormOnError<T, TanStackForm> | undefined,
    instrumentation: instrumentation as UseFormInstrumentation<T, TData> | undefined,
    disabled,
    preview,
    schema,
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [previewStatus, setPreviewStatus] = useState<"invalid" | "valid" | null>(null);

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
    setPreviewStatus(null);
  }, [state.schema]);

  const setPageIndex = (next: number) => {
    setPreviewStatus(null);
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
      setPreviewStatus(valid ? "valid" : "invalid");
      return;
    }

    if (valid) {
      void state.tanstack.handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={twx("text-wrap", className)}
      {...props}
      onChange={() => {
        if (previewStatus) setPreviewStatus(null);
      }}
    >
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
              className={twx(
                "cursor-pointer transition-opacity",
                isFirstPage && "pointer-events-none opacity-0!",
              )}
            >
              <RiArrowLeftLine className="size-4" />
              <span>Back</span>
            </Button>
            <div className="flex-1" />
            {!isLastPage ? (
              <Button type="button" onClick={handleNext} className="cursor-pointer">
                <span>Continue</span>
                <RiArrowRightLine className="size-4" />
              </Button>
            ) : (
              <state.tanstack.SubmitButton schema={state.schema} disabled={disabled} />
            )}
          </div>
        ) : (
          <state.tanstack.SubmitButton schema={state.schema} disabled={disabled} />
        )}
        {preview && previewStatus ? (
          <Alert className="mt-4" variant={previewStatus === "invalid" ? "destructive" : "success"}>
            {previewStatus === "valid" ? <RiCheckboxCircleLine /> : <RiErrorWarningLine />}
            <AlertTitle>
              {previewStatus === "valid" ? "Preview only" : "Check the highlighted fields"}
            </AlertTitle>
            <AlertDescription>
              {previewStatus === "valid"
                ? "Nothing was submitted."
                : "This is a preview. Fix the errors to continue."}
            </AlertDescription>
          </Alert>
        ) : null}
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

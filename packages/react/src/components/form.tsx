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
import { Button } from "@formbro/ui/button";
import { Progress } from "@formbro/ui/progress";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";
import * as React from "react";
import { useState } from "react";
import { type UseFormInstrumentation, useForm } from "../hooks/use-form";
import { Page } from "./page";

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

  const isMultiPage = state.schema.pages.length > 1;
  const currentPage = state.schema.pages[currentPageIndex];
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === state.schema.pages.length - 1;
  const computePercent = (pageIndex: number) =>
    state.schema.pages.length > 1
      ? Math.round((pageIndex / (state.schema.pages.length - 1)) * 100)
      : 0;
  const percent = computePercent(currentPageIndex);

  const setPageIndex = (next: number) => {
    setCurrentPageIndex(next);
    onPercentChange?.(computePercent(next));
  };

  if (!currentPage) {
    throw new Error("Page not found");
  }

  const handleNext = async () => {
    if (disabled || preview) {
      if (!isLastPage) setPageIndex(currentPageIndex + 1);
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

    if (disabled || preview) {
      return;
    }

    const valid = await state.validate();

    if (valid) {
      void state.tanstack.handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={twx("text-wrap", className)} {...props}>
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

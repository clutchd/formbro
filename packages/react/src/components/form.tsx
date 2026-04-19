"use client";

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
import { useEffect, useState } from "react";
import * as React from "react";
import { type UseFormInstrumentation, useForm } from "../hooks/use-form";
import { Page } from "./page";

export type FormProps<T extends FormInput = FormInput, TData = unknown> = {
  schema: T;
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

export function Form<T extends FormInput = FormInput, TData = unknown>({
  schema,
  action,
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
  ...props
}: FormProps<T, TData>) {
  const state = useForm<T, TData>({
    schema,
    action,
    onMutate,
    onSuccess,
    onError,
    instrumentation,
    disabled,
    preview,
    debug,
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const isMultiPage = state.schema.pages.length > 1;
  const currentPage = state.schema.pages[currentPageIndex];
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === state.schema.pages.length - 1;
  const percent =
    state.schema.pages.length > 1
      ? Math.round((currentPageIndex / (state.schema.pages.length - 1)) * 100)
      : 0;

  useEffect(() => {
    onPercentChange?.(percent);
  }, [percent, onPercentChange]);

  if (!schema) {
    throw new Error("Form schema is required");
  }

  if (!currentPage) {
    throw new Error("Page not found");
  }

  const handleNext = async () => {
    if (disabled || preview) {
      if (!isLastPage) setCurrentPageIndex((prev) => prev + 1);
      return;
    }

    const valid = await state.validatePage(currentPageIndex);

    if (valid && !isLastPage) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstPage) setCurrentPageIndex((prev) => prev - 1);
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

      {isMultiPage && !onPercentChange && <Progress className="h-1" value={percent} />}

      {debug && <pre>{JSON.stringify(state.tanstack.state, null, 2)}</pre>}
    </form>
  );
}

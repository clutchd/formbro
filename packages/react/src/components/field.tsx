"use client";

import type { CompiledField } from "@formbro/core/compile";
import { twx } from "@formbro/shared/twx";
import { FieldContent, FieldDescription, FieldError, Field as RootField } from "@formbro/ui/field";
import { Spinner } from "@formbro/ui/spinner";
import { RiErrorWarningLine } from "@remixicon/react";
import * as React from "react";
import type { TanStackFieldProps, TanStackForm } from "../hooks/tanstack";
import { FieldComponents } from "../registry";
import { FieldLabel } from "./field-label";

export function Field({
  tanstack,
  schema,
  label,
  validators,
  listeners,
}: {
  tanstack: TanStackForm;
  schema: CompiledField;
  label?: React.ReactNode;
  validators?: TanStackFieldProps["validators"];
  listeners?: TanStackFieldProps["listeners"];
}) {
  const { component: Component } = FieldComponents[schema.type as keyof typeof FieldComponents];

  if (!Component) {
    throw new Error(`Component is required for field ${schema.id}`);
  }

  return (
    <tanstack.AppField
      name={schema.id}
      {...(validators && {
        validators: validators,
      })}
      {...(listeners && {
        listeners: {
          onChange: listeners?.onChange,
          onBlur: listeners?.onBlur,
          onSubmit: listeners?.onSubmit,
          onMount: listeners?.onMount,
        },
      })}
    >
      {(field) => {
        const LabelContent = label ?? schema.label;
        const Label = LabelContent && (
          <FieldLabel htmlFor={schema.id}>
            <span className="inline-flex items-center gap-1">
              {LabelContent}
              {schema.required && (
                <span className="font-normal text-destructive" aria-hidden="true">
                  *
                </span>
              )}
            </span>
          </FieldLabel>
        );
        const Description = schema.description && (
          <FieldDescription>{schema.description}</FieldDescription>
        );

        const hasErrors = field.state.meta.errors.length > 0;
        const errored = field.state.meta.isTouched && hasErrors;

        return (
          <RootField
            data-invalid={errored}
            orientation={schema.orientation}
            className={twx(
              "transition-all duration-200",
              errored && "animate-in duration-200 fade-in",
            )}
          >
            {Label && Description ? (
              <FieldContent>
                {Label}
                {Description}
              </FieldContent>
            ) : (
              <>
                {Label}
                {Description}
              </>
            )}
            <div className="relative">
              <Component
                schema={schema}
                aria-invalid={errored}
                aria-required={schema.required}
                aria-describedby={
                  errored
                    ? `${schema.id}-error`
                    : schema.description
                      ? `${schema.id}-description`
                      : undefined
                }
              />
            </div>
            <div
              className={twx(
                "flex items-center gap-2 overflow-hidden text-sm text-muted-foreground transition-all duration-200",
                field.state.meta.isTouched && (field.state.meta.isValidating || hasErrors)
                  ? "max-h-24 opacity-100"
                  : "max-h-0 opacity-0",
              )}
            >
              {field.state.meta.isTouched &&
                (field.state.meta.isValidating ? (
                  <>
                    <Spinner className="size-3.5" />
                    <span>Validating...</span>
                  </>
                ) : (
                  hasErrors && (
                    <>
                      <RiErrorWarningLine className="mt-0.5 size-4 shrink-0 text-destructive" />
                      <FieldError errors={field.state.meta.errors} />
                    </>
                  )
                ))}
            </div>
          </RootField>
        );
      }}
    </tanstack.AppField>
  );
}

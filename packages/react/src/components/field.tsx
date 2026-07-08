"use client";

import type { CompiledField } from "@formbro/core/compile";
import * as React from "react";
import type { TanStackFieldProps, TanStackForm } from "../hooks/tanstack.js";
import { getFieldComponent } from "../registry.js";
import { cx } from "../utils/cx.js";
import { FieldLabel } from "./field-label.js";
import {
  FieldContent,
  FieldDescription,
  FieldError,
  Field as RootField,
  Spinner,
} from "./primitives.js";

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
  const Component = getFieldComponent(schema.type);

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
                <span className="font-normal text-red-700" aria-hidden="true">
                  *
                </span>
              )}
            </span>
          </FieldLabel>
        );
        const descriptionId = `${schema.id}-description`;
        const errorId = `${schema.id}-error`;
        const Description = schema.description && (
          <FieldDescription id={descriptionId}>{schema.description}</FieldDescription>
        );

        const hasErrors = field.state.meta.errors.length > 0;
        const errored = field.state.meta.isTouched && hasErrors;

        return (
          <RootField
            data-invalid={errored}
            orientation={schema.orientation}
            className={cx(
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
                ariaInvalid={errored}
                ariaRequired={schema.required}
                ariaDescribedBy={errored ? errorId : schema.description ? descriptionId : undefined}
              />
            </div>
            <div
              className={cx(
                "flex items-center gap-2 overflow-hidden text-sm text-neutral-600 transition-all duration-200",
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
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-red-700 text-xs leading-none text-red-700">
                        !
                      </span>
                      <FieldError id={errorId} errors={field.state.meta.errors} />
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

"use client";

import type { ChangeEvent, ComponentProps } from "react";
import type { FieldComponentProps } from "../types.js";
import { Input, Textarea } from "../components/primitives.js";
import { useFieldContext } from "../hooks/tanstack-context.js";

type TextFieldOptions =
  | {
      autoComplete: string;
      kind: "input";
      placeholder?: string;
      type: ComponentProps<"input">["type"];
    }
  | {
      autoComplete: string;
      kind: "textarea";
      placeholder?: string;
    };

export function createTextField(options: TextFieldOptions) {
  return function TextField({
    ariaDescribedBy,
    ariaInvalid,
    ariaRequired,
    schema,
  }: FieldComponentProps) {
    const field = useFieldContext<string>();
    const placeholder = schema.placeholder ?? options.placeholder ?? "";
    const controlProps = {
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      "aria-required": ariaRequired,
      autoComplete: options.autoComplete,
      id: schema.id,
      name: schema.id,
      onBlur: field.handleBlur,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        field.handleChange(event.target.value),
      placeholder,
      value: field.state.value ?? "",
    };

    if (options.kind === "textarea") {
      return <Textarea {...controlProps} />;
    }

    return <Input {...controlProps} type={options.type} />;
  };
}

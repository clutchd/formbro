"use client";

import type { IFieldProps } from "@formbro/core/schema/form";
import { Input } from "@formbro/ui/input";
import { RiLinkM } from "@remixicon/react";
import * as React from "react";
import {
  EditorInputPreview,
  FieldEditor,
  type EditorFieldElement,
  type EditorProps,
} from "../editor";
import { useFieldContext } from "../hooks/tanstack-context";

export const icon = RiLinkM;
export const color = "bg-cyan-100 text-cyan-600";

export const component = function LinkComponent({ schema, ariaInvalid }: IFieldProps) {
  const field = useFieldContext<string>();

  return (
    <Input
      id={schema.id}
      name={schema.id}
      type="url"
      placeholder={schema?.placeholder ?? "https://"}
      autoComplete="url"
      value={field.state.value ?? ""}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      aria-invalid={ariaInvalid}
    />
  );
};

export function editor(props: EditorProps<EditorFieldElement>) {
  return (
    <FieldEditor {...props}>
      <EditorInputPreview
        element={props.element}
        fallbackPlaceholder="https://example.com"
        type="url"
      />
    </FieldEditor>
  );
}

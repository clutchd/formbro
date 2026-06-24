import type { IFieldProps } from "@formbro/core/schema/form";
import { Input } from "@formbro/ui/input";
import { RiHashtag } from "@remixicon/react";
import * as React from "react";
import {
  EditorInputPreview,
  FieldEditor,
  type EditorFieldElement,
  type EditorProps,
} from "../editor";
import { useFieldContext } from "../hooks/tanstack-context";

export const icon = RiHashtag;
export const color = "bg-blue-100 text-blue-600";

export const component = function NumberComponent({ schema, ariaInvalid }: IFieldProps) {
  const field = useFieldContext<number | "">();

  return (
    <Input
      id={schema.id}
      name={schema.id}
      type="number"
      placeholder={schema?.placeholder ?? ""}
      autoComplete="off"
      value={field.state.value ?? ""}
      onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : "")}
      onBlur={field.handleBlur}
      aria-invalid={ariaInvalid}
    />
  );
};

export function editor(props: EditorProps<EditorFieldElement>) {
  return (
    <FieldEditor {...props}>
      <EditorInputPreview element={props.element} fallbackPlaceholder="0" type="number" />
    </FieldEditor>
  );
}

import type { IFieldProps } from "@formbro/core/schema/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@formbro/ui/select";
import { RiListCheck } from "@remixicon/react";
import * as React from "react";
import {
  EditorSelectPreview,
  FieldEditor,
  choiceFieldEditorProperties,
  type EditorFieldElement,
  type EditorProps,
} from "../editor";
import { useFieldContext } from "../hooks/tanstack-context";

export const icon = RiListCheck;
export const color = "bg-emerald-100 text-emerald-600";

export const component = function SingleSelectComponent({ schema, ariaInvalid }: IFieldProps) {
  const field = useFieldContext<string>();
  const options =
    Array.isArray(schema.options) && schema.options.length > 0
      ? schema.options
      : ["Option 1", "Option 2", "Option 3"];
  const validOptions = options.filter((option) => option.trim().length > 0);
  const fallbackOptions =
    validOptions.length > 0 ? validOptions : ["Option 1", "Option 2", "Option 3"];
  const selectedValue =
    typeof field.state.value === "string" && fallbackOptions.includes(field.state.value)
      ? field.state.value
      : undefined;

  return (
    <Select value={selectedValue} onValueChange={(value) => field.handleChange(value)}>
      <SelectTrigger
        id={schema.id}
        aria-invalid={ariaInvalid}
        className="w-full"
        onBlur={field.handleBlur}
      >
        <SelectValue placeholder={schema.placeholder ?? "Select an option"} />
      </SelectTrigger>
      <SelectContent>
        {fallbackOptions.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export function editor(props: EditorProps<EditorFieldElement>) {
  return (
    <FieldEditor {...props} properties={choiceFieldEditorProperties}>
      <EditorSelectPreview element={props.element} fallbackPlaceholder="Select an option" />
    </FieldEditor>
  );
}

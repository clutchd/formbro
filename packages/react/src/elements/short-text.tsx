import type { FormFieldInput, IFieldProps } from "@formbro/core/schema/form";
import { Input } from "@formbro/ui/input";
import { RiInputField } from "@remixicon/react";
import { EditorInputPreview, FieldEditor, type EditorProps } from "../editor";
import { useFieldContext } from "../hooks/tanstack-context";

export const icon = RiInputField;
export const color = "bg-rose-100 text-rose-600";

export const component = function ShortTextComponent({ schema, ariaInvalid }: IFieldProps) {
  const field = useFieldContext<string>();

  return (
    <Input
      id={schema.id}
      name={schema.id}
      type="text"
      placeholder={schema?.placeholder ?? ""}
      autoComplete="off"
      value={field.state.value ?? ""}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      aria-invalid={ariaInvalid}
    />
  );
};

export function editor(props: EditorProps<FormFieldInput>) {
  return (
    <FieldEditor {...props}>
      <EditorInputPreview element={props.element} fallbackPlaceholder="Type your answer" />
    </FieldEditor>
  );
}

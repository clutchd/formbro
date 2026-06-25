import type { FormFieldInput, IFieldProps } from "@formbro/core/schema/form";
import { Input } from "@formbro/ui/input";
import { RiMailLine } from "@remixicon/react";
import { EditorInputPreview, FieldEditor, type EditorProps } from "../editor";
import { useFieldContext } from "../hooks/tanstack-context";

export const icon = RiMailLine;
export const color = "bg-blue-100 text-blue-600";

export const component = function EmailComponent({ schema, ariaInvalid }: IFieldProps) {
  const field = useFieldContext<string>();

  return (
    <Input
      id={schema.id}
      name={schema.id}
      type="email"
      placeholder={schema?.placeholder ?? ""}
      autoComplete="email"
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
      <EditorInputPreview
        element={props.element}
        fallbackPlaceholder="name@example.com"
        type="email"
      />
    </FieldEditor>
  );
}

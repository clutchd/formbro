import type { IFieldProps } from "@formbro/core/schema/form";
import { Input } from "@formbro/ui/input";
import { RiInputField } from "@remixicon/react";
import { useFieldContext } from "../hooks/tanstack-context";

export const icon = RiInputField;
export const color = "bg-rose-100 text-rose-600";

export const component = function ShortTextComponent({ schema, ...ariaAttributes }: IFieldProps) {
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
      {...ariaAttributes}
    />
  );
};

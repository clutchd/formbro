import type { IFieldProps } from "@formbro/core/schema/form";
import { Textarea } from "@formbro/ui/textarea";
import { RiText } from "@remixicon/react";
import { useFieldContext } from "../hooks/tanstack-context";

export const icon = RiText;
export const color = "bg-orange-100 text-orange-600";

export const component = function LongTextComponent({ schema, ariaInvalid }: IFieldProps) {
  const field = useFieldContext<string>();

  return (
    <Textarea
      id={schema.id}
      name={schema.id}
      placeholder={schema?.placeholder ?? ""}
      autoComplete="off"
      value={field.state.value ?? ""}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      aria-invalid={ariaInvalid}
    />
  );
};

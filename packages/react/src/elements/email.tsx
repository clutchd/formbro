import type { IFieldProps } from "@formbro/core/schema/form";
import { Input } from "@formbro/ui/input";
import { RiMailLine } from "@remixicon/react";
import { useFieldContext } from "../hooks/tanstack-context";

export const icon = RiMailLine;
export const color = "bg-blue-100 text-blue-600";

export const component = function EmailComponent({ schema, ...ariaProps }: IFieldProps) {
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
      {...ariaProps}
    />
  );
};

import type { IFieldProps } from "@formbro/core/schema/form";
import { Input } from "@formbro/ui/input";
import { RiMailLine } from "@remixicon/react";
import * as React from "react";
import { useFieldContext } from "../hooks/tanstack-context";

export const icon = RiMailLine;
export const color = "bg-blue-100 text-blue-600";

export function component({ schema, ariaInvalid }: IFieldProps) {
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
}

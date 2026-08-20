"use client";

import type { IFieldProps } from "@formbro/core/schema/form";
import { Input } from "@formbro/ui/input";
import { RiLinkM } from "@remixicon/react";
import { useFieldContext } from "../hooks/tanstack-context";

export const icon = RiLinkM;
export const color = "bg-cyan-100 text-cyan-600";

export const component = function LinkComponent({ schema, ...ariaProps }: IFieldProps) {
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
      {...ariaProps}
    />
  );
};

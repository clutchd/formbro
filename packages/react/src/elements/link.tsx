"use client";

import type { FieldComponentProps } from "../types.js";
import { Input } from "../components/primitives.js";
import { useFieldContext } from "../hooks/tanstack-context.js";

export const component = function LinkComponent({
  ariaDescribedBy,
  ariaInvalid,
  ariaRequired,
  schema,
}: FieldComponentProps) {
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
      aria-required={ariaRequired}
      aria-describedby={ariaDescribedBy}
    />
  );
};

import type { IFieldProps } from "@formbro/core/schema/form";
import { Input } from "@formbro/ui/input";
import { RiHashtag } from "@remixicon/react";
import * as React from "react";
import { useFieldContext } from "../hooks/tanstack-context";

const NumberIcon = RiHashtag;
const NumberColor = "bg-blue-100 text-blue-600";

export function NumberField({ schema, ariaInvalid }: IFieldProps) {
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
}

export { NumberField as component, NumberIcon as icon, NumberColor as color };

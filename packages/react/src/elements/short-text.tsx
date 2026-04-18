import type { IFieldProps } from "@formbro/core/schema/form";
import { Input } from "@formbro/ui/input";
import { RiInputField } from "@remixicon/react";
import * as React from "react";
import { useFieldContext } from "../hooks/tanstack-context";

const ShortTextIcon = RiInputField;
const ShortTextColor = "bg-rose-100 text-rose-600";

function ShortText({ schema, ariaInvalid }: IFieldProps) {
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
}

export { ShortText as component, ShortTextIcon as icon, ShortTextColor as color };

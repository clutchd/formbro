import type { IFieldProps } from "@formbro/core/schema/form";
import { Textarea } from "@formbro/ui/textarea";
import { RiText } from "@remixicon/react";
import * as React from "react";
import { useFieldContext } from "../hooks/tanstack-context";

const LongTextIcon = RiText;
const LongTextColor = "bg-orange-100 text-orange-600";

function LongText({ schema, ariaInvalid }: IFieldProps) {
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
}

export { LongTextColor as color, LongText as component, LongTextIcon as icon };

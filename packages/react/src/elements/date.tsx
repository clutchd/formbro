import type { IFieldProps } from "@formbro/core/schema/form";
import { Input } from "@formbro/ui/input";
import { RiCalendarLine } from "@remixicon/react";
import { useFieldContext } from "../hooks/tanstack-context";

export const icon = RiCalendarLine;
export const color = "bg-violet-100 text-violet-600";

export const component = function DateComponent({ schema, ...ariaAttributes }: IFieldProps) {
  const field = useFieldContext<string>();

  return (
    <Input
      id={schema.id}
      name={schema.id}
      type="date"
      autoComplete="off"
      value={field.state.value ?? ""}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      {...ariaAttributes}
    />
  );
};

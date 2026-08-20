import type { IFieldProps } from "@formbro/core/schema/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@formbro/ui/select";
import { RiListCheck } from "@remixicon/react";
import { useFieldContext } from "../hooks/tanstack-context";
import { getChoiceOptions } from "./choice-options";

export const icon = RiListCheck;
export const color = "bg-emerald-100 text-emerald-600";

export const component = function SingleSelectComponent({ schema, ...ariaProps }: IFieldProps) {
  const field = useFieldContext<string>();
  const options = getChoiceOptions(schema.options);
  const selectedValue =
    typeof field.state.value === "string" && options.includes(field.state.value)
      ? field.state.value
      : "";

  return (
    <Select value={selectedValue} onValueChange={(value) => field.handleChange(value)}>
      <SelectTrigger id={schema.id} className="w-full" onBlur={field.handleBlur} {...ariaProps}>
        <SelectValue placeholder={schema.placeholder ?? "Select an option"} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

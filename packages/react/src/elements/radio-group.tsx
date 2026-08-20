import type { IFieldProps } from "@formbro/core/schema/form";
import { Label } from "@formbro/ui/label";
import { RadioGroup, RadioGroupItem } from "@formbro/ui/radio-group";
import { RiListRadio } from "@remixicon/react";
import { useFieldContext } from "../hooks/tanstack-context";
import { getChoiceOptions } from "./choice-options";

export const icon = RiListRadio;
export const color = "bg-violet-100 text-violet-600";

export const component = function RadioGroupComponent({ schema, ...ariaProps }: IFieldProps) {
  const field = useFieldContext<string>();
  const options = getChoiceOptions(schema.options);
  const selectedValue =
    typeof field.state.value === "string" && options.includes(field.state.value)
      ? field.state.value
      : null;

  return (
    <RadioGroup
      id={schema.id}
      name={schema.id}
      value={selectedValue}
      onValueChange={(value) => field.handleChange(value)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) field.handleBlur();
      }}
      {...ariaProps}
    >
      {options.map((option, index) => {
        const optionId = `${schema.id}-option-${index}`;

        return (
          <div key={option} className="flex items-center gap-3">
            <RadioGroupItem id={optionId} value={option} aria-invalid={ariaProps["aria-invalid"]} />
            <Label htmlFor={optionId} className="cursor-pointer leading-normal font-normal">
              {option}
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
};

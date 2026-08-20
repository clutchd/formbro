import type { IFieldProps } from "@formbro/core/schema/form";
import { Label } from "@formbro/ui/label";
import { RadioGroup, RadioGroupItem } from "@formbro/ui/radio-group";
import { RiListRadio } from "@remixicon/react";
import { useFieldContext } from "../hooks/tanstack-context";

export const icon = RiListRadio;
export const color = "bg-violet-100 text-violet-600";

export const component = function RadioGroupComponent({ schema, ariaInvalid }: IFieldProps) {
  const field = useFieldContext<string>();
  const options =
    Array.isArray(schema.options) && schema.options.length > 0
      ? schema.options
      : ["Option 1", "Option 2", "Option 3"];
  const validOptions = [...new Set(options.filter((option) => option.trim().length > 0))];
  const fallbackOptions =
    validOptions.length > 0 ? validOptions : ["Option 1", "Option 2", "Option 3"];
  const selectedValue =
    typeof field.state.value === "string" && fallbackOptions.includes(field.state.value)
      ? field.state.value
      : null;

  return (
    <RadioGroup
      id={schema.id}
      name={schema.id}
      value={selectedValue}
      aria-invalid={ariaInvalid}
      onValueChange={(value) => field.handleChange(value)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) field.handleBlur();
      }}
    >
      {fallbackOptions.map((option, index) => {
        const optionId = `${schema.id}-option-${index}`;

        return (
          <div key={option} className="flex items-center gap-3">
            <RadioGroupItem id={optionId} value={option} aria-invalid={ariaInvalid} />
            <Label htmlFor={optionId} className="cursor-pointer leading-normal font-normal">
              {option}
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
};

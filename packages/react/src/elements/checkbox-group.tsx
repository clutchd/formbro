import type { IFieldProps } from "@formbro/core/schema/form";
import { Checkbox } from "@formbro/ui/checkbox";
import { Label } from "@formbro/ui/label";
import { RiCheckboxMultipleLine } from "@remixicon/react";
import { useEffect } from "react";
import { useFieldContext } from "../hooks/tanstack-context";

export const icon = RiCheckboxMultipleLine;
export const color = "bg-sky-100 text-sky-600";

export const component = function CheckboxGroupComponent({
  schema,
  ...ariaAttributes
}: IFieldProps) {
  const field = useFieldContext<string[]>();
  const options =
    Array.isArray(schema.options) && schema.options.length > 0
      ? schema.options
      : ["Option 1", "Option 2", "Option 3"];
  const validOptions = [...new Set(options.filter((option) => option.trim().length > 0))];
  const fallbackOptions =
    validOptions.length > 0 ? validOptions : ["Option 1", "Option 2", "Option 3"];
  const rawValue = field.state.value;
  const currentValue = Array.isArray(rawValue)
    ? rawValue.filter((value): value is string => typeof value === "string")
    : [];
  const selectedOptions = fallbackOptions.filter((option) => currentValue.includes(option));
  const hasInvalidStoredValue =
    !Array.isArray(rawValue) ||
    currentValue.length !== rawValue.length ||
    selectedOptions.length !== currentValue.length;

  useEffect(() => {
    if (hasInvalidStoredValue) field.handleChange(selectedOptions);
  }, [field, hasInvalidStoredValue, selectedOptions]);

  return (
    <div
      id={schema.id}
      data-slot="checkbox-group"
      role="group"
      className="grid gap-3"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) field.handleBlur();
      }}
      {...ariaAttributes}
    >
      {fallbackOptions.map((option, index) => {
        const optionId = `${schema.id}-option-${index}`;
        const checked = selectedOptions.includes(option);

        return (
          <div key={option} className="flex items-center gap-3">
            <Checkbox
              id={optionId}
              name={schema.id}
              value={option}
              checked={checked}
              onCheckedChange={(nextChecked) => {
                field.handleChange(
                  nextChecked === true
                    ? fallbackOptions.filter(
                        (candidate) => candidate === option || selectedOptions.includes(candidate),
                      )
                    : selectedOptions.filter((candidate) => candidate !== option),
                );
              }}
            />
            <Label htmlFor={optionId} className="cursor-pointer leading-normal font-normal">
              {option}
            </Label>
          </div>
        );
      })}
    </div>
  );
};

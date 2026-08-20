import type { IFieldProps } from "@formbro/core/schema/form";
import { Checkbox } from "@formbro/ui/checkbox";
import { Label } from "@formbro/ui/label";
import { RiCheckboxMultipleLine } from "@remixicon/react";
import { useEffect, useMemo } from "react";
import { useFieldContext } from "../hooks/tanstack-context";

export const icon = RiCheckboxMultipleLine;
export const color = "bg-amber-100 text-amber-600";
const DEFAULT_OPTIONS = ["Option 1", "Option 2", "Option 3"];
const EMPTY_VALUE: string[] = [];

export const component = function MultiSelectComponent({ schema, ...ariaAttributes }: IFieldProps) {
  const field = useFieldContext<string[]>();
  const fallbackOptions = useMemo(() => {
    const options =
      Array.isArray(schema.options) && schema.options.length > 0 ? schema.options : DEFAULT_OPTIONS;
    const validOptions = [...new Set(options.filter((option) => option.trim().length > 0))];
    return validOptions.length > 0 ? validOptions : DEFAULT_OPTIONS;
  }, [schema.options]);
  const currentValue = Array.isArray(field.state.value) ? field.state.value : EMPTY_VALUE;
  const selectedValues = useMemo(
    () => fallbackOptions.filter((option) => currentValue.includes(option)),
    [currentValue, fallbackOptions],
  );
  const hasInvalidStoredValue =
    !Array.isArray(field.state.value) || selectedValues.length !== currentValue.length;

  useEffect(() => {
    if (hasInvalidStoredValue) field.handleChange(selectedValues);
  }, [field, hasInvalidStoredValue, selectedValues]);

  return (
    <div
      id={schema.id}
      role="group"
      className="grid gap-3"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) field.handleBlur();
      }}
      {...ariaAttributes}
    >
      {fallbackOptions.map((option, index) => {
        const optionId = `${schema.id}-option-${index}`;
        const checked = selectedValues.includes(option);

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
                    ? [...selectedValues, option]
                    : selectedValues.filter((value) => value !== option),
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

import type { FieldComponentProps } from "../types.js";
import { Select } from "../components/primitives.js";
import { useFieldContext } from "../hooks/tanstack-context.js";

export const component = function SingleSelectComponent({
  ariaDescribedBy,
  ariaInvalid,
  ariaRequired,
  schema,
}: FieldComponentProps) {
  const field = useFieldContext<string>();
  const options =
    Array.isArray(schema.options) && schema.options.length > 0
      ? schema.options
      : ["Option 1", "Option 2", "Option 3"];
  const validOptions = options.filter((option) => option.trim().length > 0);
  const fallbackOptions =
    validOptions.length > 0 ? validOptions : ["Option 1", "Option 2", "Option 3"];
  const selectedValue =
    typeof field.state.value === "string" && fallbackOptions.includes(field.state.value)
      ? field.state.value
      : "";

  return (
    <Select
      id={schema.id}
      name={schema.id}
      value={selectedValue}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={field.handleBlur}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
      aria-describedby={ariaDescribedBy}
    >
      <option value="">{schema.placeholder ?? "Select an option"}</option>
      {fallbackOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </Select>
  );
};

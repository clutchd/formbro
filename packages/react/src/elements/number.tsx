import type { FieldComponentProps } from "../types.js";
import { Input } from "../components/primitives.js";
import { useFieldContext } from "../hooks/tanstack-context.js";

export const component = function NumberComponent({
  ariaDescribedBy,
  ariaInvalid,
  ariaRequired,
  schema,
}: FieldComponentProps) {
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
      aria-required={ariaRequired}
      aria-describedby={ariaDescribedBy}
    />
  );
};

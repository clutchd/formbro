import type { FieldComponentProps } from "../types.js";
import { Textarea } from "../components/primitives.js";
import { useFieldContext } from "../hooks/tanstack-context.js";

export const component = function LongTextComponent({
  ariaDescribedBy,
  ariaInvalid,
  ariaRequired,
  schema,
}: FieldComponentProps) {
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
      aria-required={ariaRequired}
      aria-describedby={ariaDescribedBy}
    />
  );
};

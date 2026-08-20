import type { IFieldProps } from "@formbro/core/schema/form";
import { normalizePhoneValue } from "@formbro/core/normalization";
import { Input } from "@formbro/ui/input";
import { RiPhoneLine } from "@remixicon/react";
import { useFieldContext } from "../hooks/tanstack-context";

export const icon = RiPhoneLine;
export const color = "bg-emerald-100 text-emerald-600";

export const component = function PhoneComponent({ schema, ...ariaAttributes }: IFieldProps) {
  const field = useFieldContext<string>();

  return (
    <Input
      id={schema.id}
      name={schema.id}
      type="tel"
      inputMode="tel"
      placeholder={schema?.placeholder ?? ""}
      autoComplete="tel"
      value={field.state.value ?? ""}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={(event) => {
        const normalizedValue = normalizePhoneValue(event.currentTarget.value);
        if (normalizedValue !== event.currentTarget.value) field.handleChange(normalizedValue);
        field.handleBlur();
      }}
      {...ariaAttributes}
    />
  );
};

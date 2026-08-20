import type { CompiledForm } from "./compile";

export function normalizePhoneValue(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeSubmissionValues<TValues extends Record<string, unknown>>(
  form: CompiledForm,
  values: TValues,
): TValues {
  let normalizedValues: TValues | undefined;

  for (const page of form.pages) {
    for (const element of page.elements) {
      if (element.category !== "field" || element.type !== "phone") continue;

      const value = values[element.id];
      if (typeof value !== "string") continue;

      const normalizedValue = normalizePhoneValue(value);
      if (normalizedValue === value) continue;

      normalizedValues ??= { ...values };
      normalizedValues[element.id as keyof TValues] = normalizedValue as TValues[keyof TValues];
    }
  }

  return normalizedValues ?? values;
}

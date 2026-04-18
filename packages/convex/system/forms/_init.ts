import type { FormInput } from "@formbro/core/schema/form";

export function initForm<T extends FormInput>(slug: string, schema: T) {
  const form = {
    slug,
    schema: JSON.stringify(schema),
    typed: schema as T,
  };
  return form as { slug: string; schema: string; typed: T };
}

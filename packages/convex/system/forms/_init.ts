import type { FormInput } from "@formbro/core/schema/form";

export function initForm<const TSlug extends string, T extends FormInput>(slug: TSlug, schema: T) {
  return {
    slug,
    schema: JSON.stringify(schema),
    typed: schema,
  };
}

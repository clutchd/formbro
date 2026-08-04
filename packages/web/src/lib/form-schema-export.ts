import type { FormInput } from "@formbro/core/schema/form";

export function serializeFormSchemaExport(schema: FormInput) {
  return `${JSON.stringify(schema, null, 2)}\n`;
}

export function getFormSchemaExportFilename(formSlug: string) {
  const safeSlug = formSlug.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "") || "form";
  return `${safeSlug}.formbro.json`;
}

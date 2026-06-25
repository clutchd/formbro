import type { FormInput } from "./schema/form";

type FormElement = FormInput["elements"][number];

export type FormSchemaChangeSummary = {
  label: string;
  type: "add" | "remove" | "update";
};

function elementLabel(element: FormElement) {
  if ("label" in element && typeof element.label === "string" && element.label.trim()) {
    return element.label.trim();
  }

  return element.name;
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function summarizeFormSchemaChanges(
  before: FormInput,
  after: FormInput,
): FormSchemaChangeSummary[] {
  const operations: FormSchemaChangeSummary[] = [];

  if (before.name !== after.name) {
    operations.push({ label: "Updated form title", type: "update" });
  }

  const beforeById = new Map(before.elements.map((element) => [element.id, element]));
  const afterById = new Map(after.elements.map((element) => [element.id, element]));
  const added = after.elements.filter((element) => !beforeById.has(element.id));
  const removed = before.elements.filter((element) => !afterById.has(element.id));
  const updated = after.elements.filter((element) => {
    const previous = beforeById.get(element.id);
    return previous ? JSON.stringify(previous) !== JSON.stringify(element) : false;
  });

  if (added.length > 0) {
    operations.push({ label: `Added ${pluralize(added.length, "element")}`, type: "add" });
  }

  if (removed.length > 0) {
    operations.push({ label: `Removed ${pluralize(removed.length, "element")}`, type: "remove" });
  }

  if (updated.length > 0) {
    const label =
      updated.length === 1
        ? `Updated ${elementLabel(updated[0]!)}`
        : `Updated ${pluralize(updated.length, "element")}`;
    operations.push({ label, type: "update" });
  }

  if (JSON.stringify(before.submit ?? {}) !== JSON.stringify(after.submit ?? {})) {
    operations.push({ label: "Updated submit button", type: "update" });
  }

  return operations;
}

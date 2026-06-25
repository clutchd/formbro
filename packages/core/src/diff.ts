import type { FormInput } from "./schema/form";
import { FieldRegistry } from "./registry";

type FormElement = FormInput["elements"][number];
type ElementDiff = {
  added: FormElement[];
  removed: FormElement[];
  updated: FormElement[];
};

export type FormSchemaChangeTarget =
  | "element"
  | "field"
  | "logic"
  | "page"
  | "submit"
  | "title"
  | "toast"
  | "variable";

export type FormSchemaChangeSummary = {
  count?: number;
  label: string;
  target: FormSchemaChangeTarget;
  type: "add" | "remove" | "update";
};

export type FormSchemaChangeResult = {
  operations: FormSchemaChangeSummary[];
  summary: string;
};

const fieldTypes = new Set<string>(FieldRegistry.map((field) => field.key));

function elementLabel(element: FormElement) {
  if ("label" in element && typeof element.label === "string" && element.label.trim()) {
    return element.label.trim();
  }

  return element.name;
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formName(schema: FormInput) {
  return schema.name.trim() || "the form";
}

function elementTarget(
  element: FormElement,
): Extract<FormSchemaChangeTarget, "element" | "field" | "page"> {
  if (element.type === "page_break") return "page";
  if (fieldTypes.has(element.type)) return "field";
  return "element";
}

function targetNoun(target: Extract<FormSchemaChangeTarget, "element" | "field" | "page">) {
  switch (target) {
    case "element":
      return "element";
    case "field":
      return "field";
    case "page":
      return "page";
  }
}

function elementUpdateLabel(element: FormElement) {
  const target = elementTarget(element);

  if (target === "field") return `Updated ${elementLabel(element)}`;
  if (target === "page") return `Updated page: ${elementLabel(element)}`;
  if (element.type === "heading") return `Updated heading: ${elementLabel(element)}`;
  if (element.type === "description") return "Updated description text";
  if (element.type === "divider") return "Updated divider";

  return `Updated element: ${elementLabel(element)}`;
}

function summarizeElementGroup(
  elements: FormElement[],
  type: FormSchemaChangeSummary["type"],
): FormSchemaChangeSummary[] {
  const grouped = new Map<ReturnType<typeof elementTarget>, FormElement[]>();

  for (const element of elements) {
    const target = elementTarget(element);
    grouped.set(target, [...(grouped.get(target) ?? []), element]);
  }

  return [...grouped.entries()].map(([target, entries]) => {
    const count = entries.length;
    const verb = type === "add" ? "Added" : type === "remove" ? "Removed" : "Updated";
    const label =
      type === "update" && count === 1
        ? elementUpdateLabel(entries[0]!)
        : `${verb} ${pluralize(count, targetNoun(target))}`;

    return { count, label, target, type };
  });
}

function getElementDiff(before: FormInput, after: FormInput): ElementDiff {
  const beforeById = new Map(before.elements.map((element) => [element.id, element]));
  const afterById = new Map(after.elements.map((element) => [element.id, element]));

  return {
    added: after.elements.filter((element) => !beforeById.has(element.id)),
    removed: before.elements.filter((element) => !afterById.has(element.id)),
    updated: after.elements.filter((element) => {
      const previous = beforeById.get(element.id);
      return previous ? JSON.stringify(previous) !== JSON.stringify(element) : false;
    }),
  };
}

function countFormElements(elements: FormElement[]) {
  let contentBlocks = 0;
  let fields = 0;
  let pageBreaks = 0;

  for (const element of elements) {
    const target = elementTarget(element);

    if (target === "field") fields += 1;
    else if (target === "page") pageBreaks += 1;
    else contentBlocks += 1;
  }

  return {
    contentBlocks,
    fields,
    pageBreaks,
    pages: elements.length > 0 ? pageBreaks + 1 : 0,
  };
}

function isFullFormRebuild(
  before: FormInput,
  after: FormInput,
  diff = getElementDiff(before, after),
) {
  const isStarterForm =
    before.elements.length <= 1 &&
    before.elements.every((element) => element.type === "heading") &&
    after.elements.length >= 3;
  const replacesSeveralBlocks = diff.added.length >= 4 && diff.removed.length >= 4;

  return isStarterForm || replacesSeveralBlocks;
}

function summarizeRebuiltStructure(after: FormInput): FormSchemaChangeSummary[] {
  const counts = countFormElements(after.elements);
  const operations: FormSchemaChangeSummary[] = [];

  if (counts.fields > 0) {
    operations.push({
      count: counts.fields,
      label: `Built ${pluralize(counts.fields, "field")}`,
      target: "field",
      type: "add",
    });
  }

  if (counts.pages > 1) {
    operations.push({
      count: counts.pages,
      label: `Organized into ${pluralize(counts.pages, "page")}`,
      target: "page",
      type: "update",
    });
  }

  if (counts.contentBlocks > 0) {
    operations.push({
      count: counts.contentBlocks,
      label: `Added ${pluralize(counts.contentBlocks, "element")}`,
      target: "element",
      type: "add",
    });
  }

  return operations;
}

function summarizeCollectionChange({
  afterCount,
  beforeCount,
  plural,
  singular,
  target,
  updateLabel,
}: {
  afterCount: number;
  beforeCount: number;
  plural?: string;
  singular: string;
  target: FormSchemaChangeTarget;
  updateLabel: string;
}): FormSchemaChangeSummary | null {
  const delta = afterCount - beforeCount;

  if (delta > 0) {
    return {
      count: delta,
      label: `Added ${pluralize(delta, singular, plural)}`,
      target,
      type: "add",
    };
  }

  if (delta < 0) {
    const count = Math.abs(delta);
    return {
      count,
      label: `Removed ${pluralize(count, singular, plural)}`,
      target,
      type: "remove",
    };
  }

  return { label: updateLabel, target, type: "update" };
}

export function summarizeFormSchemaChanges(
  before: FormInput,
  after: FormInput,
): FormSchemaChangeSummary[] {
  const operations: FormSchemaChangeSummary[] = [];
  const elementDiff = getElementDiff(before, after);
  const fullFormRebuild = isFullFormRebuild(before, after, elementDiff);

  if (before.name !== after.name) {
    operations.push({ label: "Updated form title", target: "title", type: "update" });
  }

  if (fullFormRebuild) {
    operations.push(...summarizeRebuiltStructure(after));
  } else {
    if (elementDiff.added.length > 0) {
      operations.push(...summarizeElementGroup(elementDiff.added, "add"));
    }

    if (elementDiff.removed.length > 0) {
      operations.push(...summarizeElementGroup(elementDiff.removed, "remove"));
    }

    if (elementDiff.updated.length > 0) {
      operations.push(...summarizeElementGroup(elementDiff.updated, "update"));
    }
  }

  if (JSON.stringify(before.submit ?? {}) !== JSON.stringify(after.submit ?? {})) {
    operations.push({ label: "Updated submit button", target: "submit", type: "update" });
  }

  if (JSON.stringify(before.listeners ?? []) !== JSON.stringify(after.listeners ?? [])) {
    const operation = summarizeCollectionChange({
      afterCount: after.listeners?.length ?? 0,
      beforeCount: before.listeners?.length ?? 0,
      plural: "logic rules",
      singular: "logic rule",
      target: "logic",
      updateLabel: "Updated logic",
    });
    if (operation) operations.push(operation);
  }

  if (JSON.stringify(before.toasts ?? {}) !== JSON.stringify(after.toasts ?? {})) {
    operations.push({ label: "Updated toast messages", target: "toast", type: "update" });
  }

  if (JSON.stringify(before.variables ?? {}) !== JSON.stringify(after.variables ?? {})) {
    const beforeCount = Object.keys(before.variables ?? {}).length;
    const afterCount = Object.keys(after.variables ?? {}).length;
    const operation = summarizeCollectionChange({
      afterCount,
      beforeCount,
      singular: "variable",
      target: "variable",
      updateLabel: "Updated variables",
    });
    if (operation) operations.push(operation);
  }

  return operations;
}

export function summarizeFormSchemaChangeResult(
  before: FormInput,
  after: FormInput,
): FormSchemaChangeResult {
  const operations = summarizeFormSchemaChanges(before, after);

  if (operations.length === 0) {
    return {
      operations,
      summary: "No draft changes were needed.",
    };
  }

  const counts = countFormElements(after.elements);
  const fieldPhrase = counts.fields > 0 ? ` with ${pluralize(counts.fields, "field")}` : "";
  const pagePhrase = counts.pages > 1 ? ` across ${pluralize(counts.pages, "page")}` : "";
  const action = isFullFormRebuild(before, after) ? "Created" : "Updated";

  return {
    operations,
    summary: `${action} ${formName(after)}${fieldPhrase}${pagePhrase}.`,
  };
}

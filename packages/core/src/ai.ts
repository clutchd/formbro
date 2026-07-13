import { z } from "zod";
import { getElementTarget } from "./registry.js";
import { FormElementSchema, FormSchema, type FormInput, type FormOutput } from "./schema/form.js";

export const FormSchemaChangeSummarySchema = z.strictObject({
  count: z.number().int().positive().optional(),
  label: z.string(),
  target: z
    .enum(["element", "field", "logic", "page", "submit", "title", "toast", "variable"])
    .default("element"),
  type: z.enum(["add", "remove", "update"]),
});

const FormSubmitEditSchema = z
  .strictObject({
    label: z.string().optional(),
    size: z.enum(["default", "full-width"]).optional(),
    variant: z.enum(["default", "destructive"]).optional(),
  })
  .nullable();

const ElementIdSchema = z.string().min(1);
const FormElementListSchema = z.array(FormElementSchema).min(1);
const ElementPlacementSchema = z.strictObject({
  id: ElementIdSchema,
  afterId: ElementIdSchema.optional(),
});
const elementSummaryTargetOrder: FormSchemaChangeSummary["target"][] = [
  "page",
  "element",
  "field",
  "logic",
  "variable",
  "toast",
];

export const FormSchemaEditInputSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("set_form_name"),
    label: z.string().min(1),
    name: z.string().min(1),
  }),
  z.strictObject({
    type: z.literal("add_pages"),
    label: z.string().min(1),
    elements: FormElementListSchema,
    placements: z.array(ElementPlacementSchema).min(1),
  }),
  z.strictObject({
    type: z.literal("add_layout_elements"),
    label: z.string().min(1),
    elements: FormElementListSchema,
    placements: z.array(ElementPlacementSchema).min(1),
  }),
  z.strictObject({
    type: z.literal("add_fields"),
    label: z.string().min(1),
    elements: FormElementListSchema,
    placements: z.array(ElementPlacementSchema).min(1),
  }),
  z.strictObject({
    type: z.literal("update_elements"),
    label: z.string().min(1),
    elements: FormElementListSchema,
  }),
  z.strictObject({
    type: z.literal("remove_elements"),
    label: z.string().min(1),
    ids: z.array(ElementIdSchema).min(1),
  }),
  z.strictObject({
    type: z.literal("move_elements"),
    label: z.string().min(1),
    placements: z.array(ElementPlacementSchema).min(1),
  }),
  z.strictObject({
    type: z.literal("update_submit"),
    label: z.string().min(1),
    submit: FormSubmitEditSchema,
  }),
]);

export const FormSchemaEditInputPreviewSchema = z
  .object({
    label: z.string().min(1).optional(),
    type: z.string().min(1).optional(),
  })
  .passthrough();

const LegacyFormSchemaEditOutputSchema = z.strictObject({
  operation: FormSchemaChangeSummarySchema,
});

export const FormSchemaEditOutputSchema = z.strictObject({
  operations: z.array(FormSchemaChangeSummarySchema).min(1),
});

export const FinishFormSchemaEditInputSchema = z.strictObject({
  summary: z.string().min(1),
});

export const FinishFormSchemaEditOutputSchema = z.strictObject({
  summary: z.string().min(1),
});

export type FormSchemaChangeSummary = z.output<typeof FormSchemaChangeSummarySchema>;
export type FormSchemaEditInput = z.output<typeof FormSchemaEditInputSchema>;
export type FormSchemaEditInputPreview = z.output<typeof FormSchemaEditInputPreviewSchema>;
export type FormSchemaEditOutput = z.output<typeof FormSchemaEditOutputSchema>;
export type FinishFormSchemaEditOutput = z.output<typeof FinishFormSchemaEditOutputSchema>;
type AddFormSchemaEditInput = Extract<
  FormSchemaEditInput,
  { type: "add_fields" | "add_layout_elements" | "add_pages" }
>;

export type FormEditorAiMessageMetadata = {
  aiTraceId?: string;
  formId?: string;
  model?: string;
  totalTokens?: number;
  workspaceId?: string;
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function targetNoun(target: FormSchemaChangeSummary["target"], count: number) {
  switch (target) {
    case "field":
      return pluralize(count, "field");
    case "logic":
      return pluralize(count, "logic rule");
    case "page":
      return pluralize(count, "page");
    case "submit":
      return "submit button";
    case "title":
      return "form name";
    case "toast":
      return pluralize(count, "toast message");
    case "variable":
      return pluralize(count, "variable");
    case "element":
      return pluralize(count, "element");
  }
}

function operationVerb(type: FormSchemaChangeSummary["type"]) {
  if (type === "add") return "Added";
  if (type === "remove") return "Removed";
  return "Updated";
}

function summarizeElementOperations(
  elements: FormOutput["elements"],
  type: FormSchemaChangeSummary["type"],
): FormSchemaChangeSummary[] {
  const countsByTarget = new Map<FormSchemaChangeSummary["target"], number>();

  for (const element of elements) {
    const target = getElementTarget(element.type);
    countsByTarget.set(target, (countsByTarget.get(target) ?? 0) + 1);
  }

  return elementSummaryTargetOrder.flatMap((target) => {
    const count = countsByTarget.get(target) ?? 0;
    if (count === 0) return [];

    return {
      count,
      label: `${operationVerb(type)} ${count} ${targetNoun(target, count)}`,
      target,
      type,
    };
  });
}

function insertElementAfter({
  afterId,
  elementsToInsert,
  elements,
}: {
  afterId?: string;
  elementsToInsert: FormOutput["elements"];
  elements: FormOutput["elements"];
}) {
  if (!afterId) return [...elements, ...elementsToInsert];

  const afterIndex = elements.findIndex((entry) => entry.id === afterId);
  if (afterIndex === -1) return [...elements, ...elementsToInsert];

  return [
    ...elements.slice(0, afterIndex + 1),
    ...elementsToInsert,
    ...elements.slice(afterIndex + 1),
  ];
}

function assertInsertAnchorExists(elements: FormOutput["elements"], afterId: string | undefined) {
  if (!afterId) return;
  if (elements.some((element) => element.id === afterId)) return;

  throw new Error(`Cannot complete operation: unknown insertion anchor ${afterId}.`);
}

function assertSequentialPlacements(input: AddFormSchemaEditInput) {
  const elementIds = new Set(input.elements.map((element) => element.id));
  const placedIds = new Set<string>();
  const anchorIds = new Set<string | null>();

  for (const placement of input.placements) {
    const anchorId = placement.afterId ?? null;

    if (!elementIds.has(placement.id)) {
      throw new Error(`Cannot complete operation: unknown placement element ${placement.id}.`);
    }
    if (placedIds.has(placement.id)) {
      throw new Error(`Cannot complete operation: duplicate placement element ${placement.id}.`);
    }
    if (anchorIds.has(anchorId)) {
      throw new Error(
        `Cannot complete operation: duplicate insertion anchor ${placement.afterId ?? "append"}.`,
      );
    }

    placedIds.add(placement.id);
    anchorIds.add(anchorId);
  }

  if (placedIds.size !== elementIds.size) {
    throw new Error("Cannot complete operation: every added element must have a placement.");
  }
}

function assertAddOperationCategory(input: AddFormSchemaEditInput) {
  const expectedTarget =
    input.type === "add_pages" ? "page" : input.type === "add_fields" ? "field" : "element";
  const mismatched = input.elements.filter(
    (element) => getElementTarget(element.type) !== expectedTarget,
  );

  if (mismatched.length > 0) {
    throw new Error(
      `Cannot complete operation: ${input.type} cannot add ${mismatched
        .map((element) => element.type)
        .join(", ")}.`,
    );
  }
}

function insertAddedElements(current: FormOutput, input: AddFormSchemaEditInput) {
  assertAddOperationCategory(input);
  assertSequentialPlacements(input);

  const insertedIds = new Set(input.elements.map((element) => element.id));
  let elements = current.elements.filter((element) => !insertedIds.has(element.id));
  const elementsById = new Map(input.elements.map((element) => [element.id, element]));

  for (const placement of input.placements) {
    assertInsertAnchorExists(elements, placement.afterId);
    const element = elementsById.get(placement.id);
    if (!element) continue;

    elements = insertElementAfter({
      afterId: placement.afterId,
      elementsToInsert: [element],
      elements,
    });
  }

  return elements;
}

function findMissingElementIds(schema: FormInput, ids: string[]) {
  const existingIds = new Set(schema.elements.map((element) => element.id));
  return ids.filter((id) => !existingIds.has(id));
}

function assertExistingElementIds(schema: FormInput, ids: string[]) {
  const missingIds = findMissingElementIds(schema, ids);

  if (missingIds.length > 0) {
    throw new Error(`Cannot complete operation: unknown element ${missingIds.join(", ")}.`);
  }
}

export function applyFormSchemaEdit(
  schema: FormInput,
  input: FormSchemaEditInput,
): { operations: FormSchemaChangeSummary[]; schema: FormInput } {
  const current = FormSchema.parse(schema);
  let operations: FormSchemaChangeSummary[] = [];
  let next: FormOutput = current;

  switch (input.type) {
    case "set_form_name": {
      next = {
        ...current,
        name: input.name,
      };
      operations = [{ label: "Updated form name", target: "title", type: "update" }];
      break;
    }
    case "add_fields":
    case "add_layout_elements":
    case "add_pages": {
      next = {
        ...current,
        elements: insertAddedElements(current, input),
      };
      operations = summarizeElementOperations(input.elements, "add");
      break;
    }
    case "update_elements": {
      assertExistingElementIds(
        current,
        input.elements.map((element) => element.id),
      );

      const updatesById = new Map(input.elements.map((element) => [element.id, element]));
      next = {
        ...current,
        elements: current.elements.map((element) => updatesById.get(element.id) ?? element),
      };
      operations = summarizeElementOperations(input.elements, "update");
      break;
    }
    case "remove_elements": {
      assertExistingElementIds(current, input.ids);

      const removedIds = new Set(input.ids);
      const removedElements = current.elements.filter((element) => removedIds.has(element.id));
      next = {
        ...current,
        elements: current.elements.filter((element) => !removedIds.has(element.id)),
      };
      operations = summarizeElementOperations(removedElements, "remove");
      break;
    }
    case "move_elements": {
      assertExistingElementIds(
        current,
        input.placements.map((placement) => placement.id),
      );

      let elements = current.elements;

      for (const placement of input.placements) {
        const moving = elements.find((element) => element.id === placement.id);
        if (!moving) continue;

        elements = insertElementAfter({
          afterId: placement.afterId,
          elementsToInsert: [moving],
          elements: elements.filter((element) => element.id !== placement.id),
        });
      }
      next = {
        ...current,
        elements,
      };
      operations = [
        {
          count: input.placements.length,
          label: `Moved ${input.placements.length} ${pluralize(input.placements.length, "element")}`,
          target: "element",
          type: "update",
        },
      ];
      break;
    }
    case "update_submit": {
      next = {
        ...current,
        submit: input.submit ?? undefined,
      };
      operations = [{ label: "Updated submit button", target: "submit", type: "update" }];
      break;
    }
  }

  return {
    operations,
    schema: FormSchema.parse(next),
  };
}

export function parseFormSchemaEditInputPreview(value: unknown): FormSchemaEditInputPreview | null {
  const preview = FormSchemaEditInputPreviewSchema.safeParse(value);
  return preview.success ? preview.data : null;
}

export function parseFormSchemaEditOutput(value: unknown): FormSchemaEditOutput | null {
  const output = FormSchemaEditOutputSchema.safeParse(value);
  if (output.success) return output.data;

  const legacyOutput = LegacyFormSchemaEditOutputSchema.safeParse(value);
  if (legacyOutput.success) return { operations: [legacyOutput.data.operation] };

  return null;
}

export function parseFinishFormSchemaEditOutput(value: unknown): FinishFormSchemaEditOutput | null {
  const output = FinishFormSchemaEditOutputSchema.safeParse(value);
  return output.success ? output.data : null;
}

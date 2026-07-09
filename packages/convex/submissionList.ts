import type { CompiledField, CompiledForm } from "@formbro/core/compile";
import type { Doc, Id } from "./_generated/dataModel";

export type SubmissionColumn = {
  id: string;
  label: string;
  type: string | null;
  firstSeenSubmittedTime: number;
  lastSeenSubmittedTime: number;
};

export type SubmissionListRow = {
  id: Id<"submissions">;
  submittedTime: number;
  values: Record<string, string>;
  columnHints: SubmissionColumn[];
};

function getCompiledFields(form: CompiledForm): CompiledField[] {
  return form.pages.flatMap((page) =>
    page.elements.filter((element): element is CompiledField => element.category === "field"),
  );
}

function formatSubmissionValue(value: unknown): string {
  if (value == null || value === "") {
    return "";
  }

  return Array.isArray(value) ? value.join(", ") : String(value);
}

export function buildSubmissionListPage(
  submissions: Doc<"submissions">[],
  formsBySchemaId: ReadonlyMap<Id<"formSchemas">, CompiledForm>,
): SubmissionListRow[] {
  const columns = new Map<string, SubmissionColumn>();

  for (const submission of submissions.toReversed()) {
    const form = formsBySchemaId.get(submission.schemaId);
    const time = submission.submittedTime;

    for (const field of form ? getCompiledFields(form) : []) {
      const existing = columns.get(field.id);
      columns.set(field.id, {
        id: field.id,
        label: field.label ?? field.name,
        type: field.type,
        firstSeenSubmittedTime: existing
          ? Math.min(existing.firstSeenSubmittedTime, time)
          : time,
        lastSeenSubmittedTime: existing ? Math.max(existing.lastSeenSubmittedTime, time) : time,
      });
    }

    for (const fieldId of Object.keys(submission.data)) {
      const existing = columns.get(fieldId);
      if (existing) {
        columns.set(fieldId, {
          ...existing,
          lastSeenSubmittedTime: Math.max(existing.lastSeenSubmittedTime, time),
        });
        continue;
      }

      columns.set(fieldId, {
        id: fieldId,
        label: fieldId,
        type: null,
        firstSeenSubmittedTime: time,
        lastSeenSubmittedTime: time,
      });
    }
  }

  const columnHints = [...columns.values()].toSorted((left, right) => {
    const firstSeenDiff = left.firstSeenSubmittedTime - right.firstSeenSubmittedTime;
    return firstSeenDiff !== 0 ? firstSeenDiff : left.label.localeCompare(right.label);
  });

  return submissions.map((submission, index) => ({
    id: submission._id,
    submittedTime: submission.submittedTime,
    values: Object.fromEntries(
      Object.entries(submission.data).map(([fieldId, value]) => [
        fieldId,
        formatSubmissionValue(value),
      ]),
    ),
    columnHints: index === 0 ? columnHints : [],
  }));
}

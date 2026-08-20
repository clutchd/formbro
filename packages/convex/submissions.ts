import type { FormValue } from "@formbro/core/schema/form";
import { compile, type CompiledField, type CompiledForm } from "@formbro/core/compile";
import { normalizeSubmissionValues } from "@formbro/core/normalization";
import { validateFormSubmission } from "@formbro/core/validation";
import { fail, ok } from "@formbro/shared/result";
import { getDocumentSize, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { getFormAccess } from "./access";
import { getUser } from "./auth";
import { defineErrors } from "./errors";
import { ERRORS as FORM_ERRORS } from "./forms";
import { SubmissionValue } from "./schema";
import { isSystemFormSlug } from "./system/initialize";

const FILE_FIELD_TYPES = new Set(["file_upload"]);

export const ERRORS = defineErrors({
  SUBMISSION_NOT_FOUND: {
    message: "Submission not found.",
    status: "NOT_FOUND",
  },
  FORM_NOT_OPEN: {
    message: "This form is not accepting responses.",
    status: "FORBIDDEN",
  },
  FORM_SCHEMA_NOT_PUBLISHED: {
    message: "This form is not accepting responses yet.",
    status: "FORBIDDEN",
  },
  FORM_SCHEMA_MISMATCH: {
    message: "This form schema is not available for submissions.",
    status: "BAD_REQUEST",
  },
  SUBMISSION_INVALID: {
    message: "Submitted form data is invalid.",
    status: "BAD_REQUEST",
  },
});

function parseStoredForm(json: string): CompiledForm | null {
  try {
    return compile(JSON.parse(json));
  } catch {
    return null;
  }
}

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

function isFileField(field: CompiledField) {
  return FILE_FIELD_TYPES.has(field.type);
}

function collectFileStorageIds(fields: CompiledField[], data: Record<string, unknown>): string[] {
  const ids: string[] = [];

  for (const field of fields) {
    if (!isFileField(field)) continue;

    const value = data[field.id];
    if (!value) continue;

    if (Array.isArray(value)) {
      ids.push(...value.map(String));
      continue;
    }

    ids.push(String(value));
  }

  return ids;
}

async function canAcceptSubmission(ctx: MutationCtx, form: Doc<"forms">) {
  switch (form.status) {
    case "open":
      return true;
    case "draft":
      return false;
    case "closed": {
      if (!isSystemFormSlug(form.slug)) return false;
      return (await getUser(ctx)).ok;
    }
    default: {
      const _exhaustive: never = form.status;
      return _exhaustive;
    }
  }
}

async function _insertSubmission(
  ctx: MutationCtx,
  {
    form,
    schemaId,
    data,
  }: {
    form: Doc<"forms">;
    schemaId: Id<"formSchemas">;
    data: Record<string, FormValue>;
  },
) {
  const submittedTime = Date.now();
  const document = {
    formId: form._id,
    schemaId,
    bytes: 0,
    workspaceId: form.workspaceId,
    data,
    submittedTime,
  };

  const bytes = getDocumentSize(document);
  const submissionId = await ctx.db.insert("submissions", {
    ...document,
    bytes,
  });

  return { submissionId, bytes };
}

export async function _createSubmission(
  ctx: MutationCtx,
  args: {
    formId: Id<"forms">;
    schemaId: Id<"formSchemas">;
    data: Record<string, FormValue>;
  },
) {
  const schema = await ctx.db.get(args.schemaId);
  if (!schema) return fail({ data: null, error: FORM_ERRORS.FORM_SCHEMA_NOT_FOUND });

  if (schema.status !== "published") {
    return fail({ data: null, error: ERRORS.FORM_SCHEMA_NOT_PUBLISHED });
  }

  if (schema.formId !== args.formId) {
    return fail({ data: null, error: ERRORS.FORM_SCHEMA_MISMATCH });
  }

  const form = await ctx.db.get(args.formId);
  if (!form) return fail({ data: null, error: FORM_ERRORS.FORM_NOT_FOUND });

  if (!(await canAcceptSubmission(ctx, form))) {
    return fail({ data: null, error: ERRORS.FORM_NOT_OPEN });
  }

  if (form.publishedSchemaId !== schema._id) {
    return fail({ data: null, error: ERRORS.FORM_SCHEMA_MISMATCH });
  }

  const compiled = parseStoredForm(schema.schema);
  if (!compiled) return fail({ data: null, error: FORM_ERRORS.SCHEMA_INVALID });

  const data = normalizeSubmissionValues(compiled, args.data);
  const validation = validateFormSubmission(compiled, data);
  if (!validation.success) {
    return fail({ data: null, error: ERRORS.SUBMISSION_INVALID });
  }

  return ok(await _insertSubmission(ctx, { form, schemaId: schema._id, data }));
}

export async function _createFromSlug(
  ctx: MutationCtx,
  args: { slug: string; data: Record<string, FormValue> },
) {
  const form = await ctx.db
    .query("forms")
    .withIndex("by_slug", (q) => q.eq("slug", args.slug))
    .unique();

  if (!form?.publishedSchemaId) return;

  await _createSubmission(ctx, {
    formId: form._id,
    schemaId: form.publishedSchemaId,
    data: args.data,
  });
}

type SubmissionPage = {
  label: string | null;
  fields: Array<{
    id: string;
    label: string;
    type: string | null;
    value: string;
  }>;
};

function buildSubmissionPages(form: CompiledForm | null, data: Record<string, unknown>) {
  const seenFieldIds = new Set<string>();
  const pages: SubmissionPage[] = (form?.pages ?? []).flatMap((page) => {
    const fields = page.elements.flatMap((element) => {
      if (element.category !== "field") return [];

      seenFieldIds.add(element.id);
      return [
        {
          id: element.id,
          label: element.label ?? element.name,
          type: element.type,
          value: formatSubmissionValue(data[element.id]),
        },
      ];
    });

    return fields.length > 0
      ? [
          {
            label: page.label ?? null,
            fields,
          },
        ]
      : [];
  });

  const unrecognizedFields = Object.entries(data).flatMap(([fieldId, value]) => {
    if (seenFieldIds.has(fieldId)) return [];

    return [
      {
        id: fieldId,
        label: fieldId,
        type: null,
        value: formatSubmissionValue(value),
      },
    ];
  });

  if (unrecognizedFields.length > 0) {
    pages.push({ label: "Other responses", fields: unrecognizedFields });
  }

  return pages;
}

async function getSubmissionFiles(
  ctx: QueryCtx,
  submissionId: Id<"submissions">,
  fields: CompiledField[],
  data: Record<string, unknown>,
) {
  const attachmentIds = collectFileStorageIds(fields, data);

  return await Promise.all(
    attachmentIds.map(async (attachmentId, index) => {
      const fileId = attachmentId as Id<"_storage">;
      const [url, metadata] = await Promise.all([
        ctx.storage.getUrl(fileId),
        ctx.db.system.get(fileId),
      ]);

      return {
        id: fileId,
        name: `submission-${submissionId}-${index + 1}`,
        url,
        size: metadata?.size ?? null,
        contentType: metadata?.contentType ?? null,
      };
    }),
  );
}

export const create = mutation({
  args: {
    formId: v.id("forms"),
    schemaId: v.id("formSchemas"),
    data: v.record(v.string(), SubmissionValue),
  },
  handler: async (ctx, args) => {
    return _createSubmission(ctx, args);
  },
});

export const list = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const formWithAccess = await getFormAccess(ctx, args.formId);
    if (!formWithAccess.ok) return fail({ data: null, error: formWithAccess.error });

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_form_submitted", (q) => q.eq("formId", args.formId))
      .order("desc")
      .collect();

    const schemaIds = [...new Set(submissions.map((submission) => submission.schemaId))];
    const compiledEntries = await Promise.all(
      schemaIds.map(async (schemaId) => {
        const schemaDoc = await ctx.db.get(schemaId);
        if (!schemaDoc) return null;

        const form = parseStoredForm(schemaDoc.schema);
        return form ? ([schemaId, form] as const) : null;
      }),
    );
    const formsBySchemaId = new Map<Id<"formSchemas">, CompiledForm>(
      compiledEntries.filter((entry): entry is [Id<"formSchemas">, CompiledForm] => entry !== null),
    );

    type Column = {
      id: string;
      label: string;
      type: string | null;
      firstSeenSubmittedTime: number | null;
      lastSeenSubmittedTime: number | null;
    };

    const columns = new Map<string, Column>();

    for (const submission of [...submissions].reverse()) {
      const form = formsBySchemaId.get(submission.schemaId);
      const time = submission.submittedTime;

      for (const field of form ? getCompiledFields(form) : []) {
        const existing = columns.get(field.id);
        columns.set(field.id, {
          id: field.id,
          label: field.label ?? field.name,
          type: field.type,
          firstSeenSubmittedTime: existing
            ? Math.min(existing.firstSeenSubmittedTime ?? time, time)
            : time,
          lastSeenSubmittedTime: existing
            ? Math.max(existing.lastSeenSubmittedTime ?? time, time)
            : time,
        });
      }

      for (const fieldId of Object.keys(submission.data)) {
        const existing = columns.get(fieldId);
        if (existing) {
          columns.set(fieldId, {
            ...existing,
            lastSeenSubmittedTime: Math.max(existing.lastSeenSubmittedTime ?? time, time),
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

    const rows = await Promise.all(
      submissions.map(async (submission) => {
        const form = formsBySchemaId.get(submission.schemaId);
        const fields = form ? getCompiledFields(form) : [];
        const files = await getSubmissionFiles(ctx, submission._id, fields, submission.data);

        return {
          id: submission._id,
          submittedTime: submission.submittedTime,
          values: Object.fromEntries(
            Object.entries(submission.data).map(([fieldId, value]) => [
              fieldId,
              formatSubmissionValue(value),
            ]),
          ),
          files,
        };
      }),
    );

    const sortedColumns = [...columns.values()].sort((left, right) => {
      const firstSeenDiff =
        (left.firstSeenSubmittedTime ?? Number.MAX_SAFE_INTEGER) -
        (right.firstSeenSubmittedTime ?? Number.MAX_SAFE_INTEGER);
      if (firstSeenDiff !== 0) return firstSeenDiff;
      return left.label.localeCompare(right.label);
    });

    const fileCount = rows.reduce((count, row) => count + row.files.length, 0);

    return ok({
      form: formWithAccess.data.form,
      columns: sortedColumns,
      rows,
      counts: {
        all: rows.length,
        completed: rows.length,
        partial: 0,
        files: fileCount,
      },
    });
  },
});

export const get = query({
  args: {
    formId: v.id("forms"),
    submissionId: v.string(),
  },
  handler: async (ctx, args) => {
    const formWithAccess = await getFormAccess(ctx, args.formId);
    if (!formWithAccess.ok) return fail({ data: null, error: formWithAccess.error });

    const submissionId = ctx.db.normalizeId("submissions", args.submissionId);
    const submission = submissionId ? await ctx.db.get(submissionId) : null;

    if (!submission || submission.formId !== args.formId) {
      return fail({ data: null, error: ERRORS.SUBMISSION_NOT_FOUND });
    }

    const schemaDoc = await ctx.db.get(submission.schemaId);
    const compiledForm = schemaDoc ? parseStoredForm(schemaDoc.schema) : null;
    const fields = compiledForm ? getCompiledFields(compiledForm) : [];
    const pages = buildSubmissionPages(compiledForm, submission.data);
    const files = await getSubmissionFiles(ctx, submission._id, fields, submission.data);
    const allFields = pages.flatMap((page) => page.fields);

    return ok({
      submission: {
        id: submission._id,
        submittedTime: submission.submittedTime,
      },
      pages,
      files,
      counts: {
        fields: allFields.length,
        answered: allFields.filter((field) => field.value !== "").length,
      },
    });
  },
});

export async function _delete(ctx: MutationCtx, submissionId: Id<"submissions">) {
  const submission = await ctx.db.get(submissionId);
  if (!submission) return fail({ data: null, error: ERRORS.SUBMISSION_NOT_FOUND });

  const schemaDoc = await ctx.db.get(submission.schemaId);
  const form = schemaDoc ? parseStoredForm(schemaDoc.schema) : null;
  const fields = form ? getCompiledFields(form) : [];

  await Promise.all(
    [...new Set(collectFileStorageIds(fields, submission.data))].map((fileId) =>
      ctx.storage.delete(fileId as Id<"_storage">),
    ),
  );

  await ctx.db.delete(submissionId);
  return ok({ submissionId });
}

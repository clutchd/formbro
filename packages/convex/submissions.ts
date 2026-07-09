import { compile, type CompiledField, type CompiledForm } from "@formbro/core/compile";
import { validateFormSubmission } from "@formbro/core/validation";
import { fail, ok } from "@formbro/shared/result";
import { getDocumentSize, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { SubmissionLimitReason } from "./billingUtils";
import { internal } from "./_generated/api";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { getFormAccess } from "./access";
import { getWorkspaceSubmissionAllowance } from "./billing";
import { defineErrors } from "./errors";
import { ERRORS as FORM_ERRORS } from "./forms";
import { SubmissionValue } from "./schema";

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
  SUBSCRIPTION_INACTIVE: {
    message: "This form is not accepting responses.",
    status: "FORBIDDEN",
  },
  MONTHLY_SUBMISSION_LIMIT_REACHED: {
    message: "This form has reached its response limit.",
    status: "FORBIDDEN",
  },
  STORAGE_LIMIT_REACHED: {
    message: "This form is not accepting responses.",
    status: "FORBIDDEN",
  },
  SUBMISSION_INVALID: {
    message: "Submitted form data is invalid.",
    status: "BAD_REQUEST",
  },
});

function getSubmissionLimitError(reason: SubmissionLimitReason) {
  switch (reason) {
    case "inactive_subscription":
      return ERRORS.SUBSCRIPTION_INACTIVE;
    case "monthly_submission_limit":
      return ERRORS.MONTHLY_SUBMISSION_LIMIT_REACHED;
    case "storage_limit":
      return ERRORS.STORAGE_LIMIT_REACHED;
    default: {
      const exhaustiveReason: never = reason;
      return exhaustiveReason;
    }
  }
}

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

export const create = mutation({
  args: {
    formId: v.id("forms"),
    schemaId: v.id("formSchemas"),
    data: v.record(v.string(), SubmissionValue),
  },
  handler: async (ctx, args) => {
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

    if (form.status !== "open") {
      return fail({ data: null, error: ERRORS.FORM_NOT_OPEN });
    }

    if (form.publishedSchemaId !== schema._id) {
      return fail({ data: null, error: ERRORS.FORM_SCHEMA_MISMATCH });
    }

    const compiled = parseStoredForm(schema.schema);
    if (!compiled) return fail({ data: null, error: FORM_ERRORS.SCHEMA_INVALID });

    const validation = validateFormSubmission(compiled, args.data);
    if (!validation.success) {
      return fail({ data: null, error: ERRORS.SUBMISSION_INVALID });
    }

    const submittedTime = Date.now();
    const data = {
      formId: form._id,
      schemaId: schema._id,
      bytes: 0,
      workspaceId: form.workspaceId,
      data: args.data,
      submittedTime,
    };

    const bytes = getDocumentSize(data);
    const allowance = await getWorkspaceSubmissionAllowance(ctx, form.workspaceId, bytes);
    if (!allowance.ok) {
      return fail({ data: null, error: allowance.error });
    }
    if (!allowance.data.allowed) {
      return fail({ data: null, error: getSubmissionLimitError(allowance.data.reason) });
    }

    const { nextStorageBytes, workspace } = allowance.data;
    const firstWorkspaceSubmission =
      workspace.firstSubmissionTime === undefined
        ? await ctx.db
            .query("submissions")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", form.workspaceId))
            .first()
        : null;
    const isFirstWorkspaceSubmission =
      workspace.firstSubmissionTime === undefined && firstWorkspaceSubmission === null;
    const submissionId = await ctx.db.insert("submissions", {
      ...data,
      bytes,
    });

    const workspacePatch: {
      firstSubmissionTime?: number;
      submissionStorageBytes?: number;
    } = {};
    if (workspace.firstSubmissionTime === undefined) {
      workspacePatch.firstSubmissionTime = firstWorkspaceSubmission?.submittedTime ?? submittedTime;
    }
    if (nextStorageBytes !== undefined) {
      workspacePatch.submissionStorageBytes = nextStorageBytes;
    }
    if (Object.keys(workspacePatch).length > 0) {
      await ctx.db.patch(workspace._id, workspacePatch);
    }

    if (isFirstWorkspaceSubmission) {
      await ctx.scheduler.runAfter(0, internal.analytics.capture, {
        deduplicationKey: `first_submission_received:${workspace._id}`,
        distinctId: workspace.ownerAuthId,
        event: "first_submission_received",
        properties: {
          bytes,
          form_id: form._id,
          form_slug: form.slug,
          submission_id: submissionId,
          workspace_id: workspace._id,
          workspace_slug: workspace.slug,
        },
        timestamp: new Date(submittedTime).toISOString(),
        workspaceId: workspace._id,
      });
    }

    return ok({ submissionId, bytes });
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
        const attachmentIds = collectFileStorageIds(fields, submission.data);

        const files = await Promise.all(
          attachmentIds.map(async (attachmentId, index) => {
            const fileId = attachmentId as Id<"_storage">;
            const [url, metadata] = await Promise.all([
              ctx.storage.getUrl(fileId),
              ctx.db.system.get(fileId),
            ]);

            return {
              id: fileId,
              name: `submission-${submission._id}-${index + 1}`,
              url,
              size: metadata?.size ?? null,
              contentType: metadata?.contentType ?? null,
            };
          }),
        );

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

export async function _delete(ctx: MutationCtx, submissionId: Id<"submissions">) {
  const submission = await ctx.db.get(submissionId);
  if (!submission) return fail({ data: null, error: ERRORS.SUBMISSION_NOT_FOUND });

  const workspace = await ctx.db.get(submission.workspaceId);
  const schemaDoc = await ctx.db.get(submission.schemaId);
  const form = schemaDoc ? parseStoredForm(schemaDoc.schema) : null;
  const fields = form ? getCompiledFields(form) : [];

  await Promise.all(
    [...new Set(collectFileStorageIds(fields, submission.data))].map((fileId) =>
      ctx.storage.delete(fileId as Id<"_storage">),
    ),
  );

  await ctx.db.delete(submissionId);
  if (workspace?.submissionStorageBytes !== undefined) {
    await ctx.db.patch(workspace._id, {
      submissionStorageBytes: Math.max(0, workspace.submissionStorageBytes - submission.bytes),
    });
  }
  return ok({ submissionId });
}

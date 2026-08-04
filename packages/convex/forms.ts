import {
  createDefaultFormSchema,
  FormSchema,
  JsonParse,
  JsonSerialize,
} from "@formbro/core/schema/form";
import { nano } from "@formbro/shared/nanoid";
import { fail, ok } from "@formbro/shared/result";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { getFormAccess, getWorkspaceAccess } from "./access";
import { requireWorkspaceSubscription } from "./billing";
import { getWorkspaceFormsUsed, isWorkspaceLimitReached } from "./billingUtils";
import { defineErrors } from "./errors";
import { _delete as _deleteSubmission } from "./submissions";

export const ERRORS = defineErrors({
  ACTIVE_FORM_LIMIT: {
    message: "Active form limit reached.",
    status: "FORBIDDEN",
  },
  FORM_NOT_FOUND: {
    message: "Form not found.",
    status: "NOT_FOUND",
  },
  FORM_SCHEMA_NOT_FOUND: {
    message: "Form schema not found.",
    status: "NOT_FOUND",
  },
  FORM_NOT_PUBLISHED: {
    message: "This form does not have a published version to restore.",
    status: "UNPROCESSABLE_ENTITY",
  },
  SCHEMA_INVALID: {
    message: "Form schema is invalid.",
    status: "UNPROCESSABLE_ENTITY",
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const access = await getWorkspaceAccess(ctx, args.workspaceId);
    if (!access.ok) return fail({ data: null, error: access.error });

    const subscriptionState = await requireWorkspaceSubscription(ctx, args.workspaceId);
    if (!subscriptionState.ok) return fail({ data: null, error: subscriptionState.error });

    if (
      await isWorkspaceLimitReached(subscriptionState.data.limits.forms, (limit) =>
        getWorkspaceFormsUsed(ctx, args.workspaceId, limit),
      )
    ) {
      return fail({ data: null, error: ERRORS.ACTIVE_FORM_LIMIT });
    }

    let slug = nano();
    while (
      await ctx.db
        .query("forms")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique()
    ) {
      slug = nano();
    }

    const formId = await ctx.db.insert("forms", {
      status: "draft",
      slug,
      workspaceId: args.workspaceId,
      name: args.name,
    });

    const schema = createDefaultFormSchema({ id: slug, name: args.name });
    const draftSchemaId = await ctx.db.insert("formSchemas", {
      formId,
      schema: JsonSerialize(schema),
      status: "draft",
      createdBy: access.data.membership._id,
    });

    await ctx.db.patch(formId, { draftSchemaId });

    return ok({ slug });
  },
});

export const get = query({
  args: { workspaceId: v.id("workspaces"), formId: v.id("forms") },
  handler: async (ctx, args) => {
    const access = await getWorkspaceAccess(ctx, args.workspaceId);
    if (!access.ok) return fail({ data: [], error: access.error });

    const form = await ctx.db.get(args.formId);
    if (!form) return fail({ data: null, error: ERRORS.FORM_NOT_FOUND });
    if (form.workspaceId !== args.workspaceId) {
      return fail({ data: null, error: ERRORS.FORM_NOT_FOUND });
    }
    return ok(form);
  },
});

export const getPublic = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const form = await ctx.db
      .query("forms")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!form) return null;

    const [publishedSchema, workspace] = await Promise.all([
      form.publishedSchemaId ? await ctx.db.get(form.publishedSchemaId) : null,
      ctx.db.get(form.workspaceId),
    ]);

    return ok({
      id: form._id,
      workspace: {
        name: workspace?.name,
        slug: workspace?.slug,
      },
      name: form.name,
      slug: form.slug,
      status: form.status,
      schemaId: publishedSchema?._id ?? null,
      schema: publishedSchema?.schema ?? null,
      publishedTime: publishedSchema?.publishedTime ?? publishedSchema?._creationTime ?? null,
    });
  },
});

export const getDraft = query({
  args: {
    formId: v.id("forms"),
  },
  handler: async (ctx, args) => {
    const formWithAccess = await getFormAccess(ctx, args.formId);
    if (!formWithAccess.ok) return fail({ data: null, error: formWithAccess.error });

    const { form } = formWithAccess.data;
    if (!form.draftSchemaId) return fail({ data: null, error: ERRORS.FORM_SCHEMA_NOT_FOUND });

    const [draftSchema, publishedSchema] = await Promise.all([
      ctx.db.get(form.draftSchemaId),
      form.publishedSchemaId ? ctx.db.get(form.publishedSchemaId) : null,
    ]);
    if (!draftSchema) return fail({ data: null, error: ERRORS.FORM_SCHEMA_NOT_FOUND });

    try {
      const schema = JsonParse(draftSchema.schema);
      const published = publishedSchema ? JsonParse(publishedSchema.schema) : null;

      return ok({
        form,
        schema,
        draftSchemaId: draftSchema._id,
        publishedSchemaId: publishedSchema?._id ?? null,
        publishedSchema: published,
        hasUnpublishedChanges: draftSchema.schema !== (publishedSchema?.schema ?? null),
      });
    } catch {
      return fail({ data: null, error: ERRORS.SCHEMA_INVALID });
    }
  },
});

export const saveDraft = mutation({
  args: {
    formId: v.id("forms"),
    schema: v.any(),
  },
  handler: async (ctx, args) => {
    const formWithAccess = await getFormAccess(ctx, args.formId);
    if (!formWithAccess.ok) return fail({ data: null, error: formWithAccess.error });

    const { form } = formWithAccess.data;
    if (!form.draftSchemaId) return fail({ data: null, error: ERRORS.FORM_SCHEMA_NOT_FOUND });

    const draftSchema = await ctx.db.get(form.draftSchemaId);
    if (!draftSchema) return fail({ data: null, error: ERRORS.FORM_SCHEMA_NOT_FOUND });

    try {
      const schema = FormSchema.parse(args.schema);
      const serialized = JsonSerialize(schema);
      await ctx.db.patch(draftSchema._id, { schema: serialized });
      if (form.name !== schema.name) {
        await ctx.db.patch(form._id, { name: schema.name });
      }

      const publishedSchema = form.publishedSchemaId
        ? await ctx.db.get(form.publishedSchemaId)
        : null;

      return ok({
        schema,
        draftSchemaId: draftSchema._id,
        publishedSchemaId: publishedSchema?._id ?? null,
        hasUnpublishedChanges: serialized !== (publishedSchema?.schema ?? null),
      });
    } catch {
      return fail({ data: null, error: ERRORS.SCHEMA_INVALID });
    }
  },
});

export const publish = mutation({
  args: {
    formId: v.id("forms"),
  },
  handler: async (ctx, args) => {
    const formWithAccess = await getFormAccess(ctx, args.formId);
    if (!formWithAccess.ok) return fail({ data: null, error: formWithAccess.error });

    const { form, access } = formWithAccess.data;
    if (!form.draftSchemaId) return fail({ data: null, error: ERRORS.FORM_SCHEMA_NOT_FOUND });

    const draftSchema = await ctx.db.get(form.draftSchemaId);
    if (!draftSchema) return fail({ data: null, error: ERRORS.FORM_SCHEMA_NOT_FOUND });

    try {
      const schema = JsonParse(draftSchema.schema);
      const serialized = JsonSerialize(schema);
      const now = Date.now();

      if (draftSchema.schema !== serialized) {
        await ctx.db.patch(draftSchema._id, { schema: serialized });
      }

      const publishedSchemaId = await ctx.db.insert("formSchemas", {
        formId: form._id,
        schema: serialized,
        status: "published",
        createdBy: access.membership._id,
        publishedTime: now,
      });
      const status = form.status === "draft" ? "open" : form.status;

      if (form.publishedSchemaId) {
        await ctx.db.patch(form.publishedSchemaId, { retiredTime: now });
      }

      await ctx.db.patch(form._id, {
        draftSchemaId: draftSchema._id,
        name: schema.name,
        publishedSchemaId,
        status,
      });

      return ok({
        schema,
        draftSchemaId: draftSchema._id,
        publishedSchemaId,
        status,
        publishedTime: now,
        hasUnpublishedChanges: false,
      });
    } catch {
      return fail({ data: null, error: ERRORS.SCHEMA_INVALID });
    }
  },
});

export const revertDraft = mutation({
  args: {
    formId: v.id("forms"),
  },
  handler: async (ctx, args) => {
    const formWithAccess = await getFormAccess(ctx, args.formId);
    if (!formWithAccess.ok) return fail({ data: null, error: formWithAccess.error });

    const { form } = formWithAccess.data;
    if (!form.draftSchemaId) return fail({ data: null, error: ERRORS.FORM_SCHEMA_NOT_FOUND });
    if (!form.publishedSchemaId) return fail({ data: null, error: ERRORS.FORM_NOT_PUBLISHED });

    const [draftSchema, publishedSchema] = await Promise.all([
      ctx.db.get(form.draftSchemaId),
      ctx.db.get(form.publishedSchemaId),
    ]);
    if (!draftSchema || !publishedSchema) {
      return fail({ data: null, error: ERRORS.FORM_SCHEMA_NOT_FOUND });
    }

    try {
      const schema = JsonParse(publishedSchema.schema);
      const serialized = JsonSerialize(schema);

      await ctx.db.patch(draftSchema._id, { schema: serialized });
      if (form.name !== schema.name) {
        await ctx.db.patch(form._id, { name: schema.name });
      }

      return ok({
        schema,
        draftSchemaId: draftSchema._id,
        publishedSchemaId: publishedSchema._id,
        hasUnpublishedChanges: false,
      });
    } catch {
      return fail({ data: null, error: ERRORS.SCHEMA_INVALID });
    }
  },
});

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const access = await getWorkspaceAccess(ctx, args.workspaceId);
    if (!access.ok) return fail({ data: [], error: access.error });

    const forms = await ctx.db
      .query("forms")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return ok(forms);
  },
});

export const updateStatus = mutation({
  args: {
    formId: v.id("forms"),
    status: v.union(v.literal("open"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    const formWithAccess = await getFormAccess(ctx, args.formId);
    if (!formWithAccess.ok) return fail({ data: [], error: formWithAccess.error });

    await ctx.db.patch(args.formId, { status: args.status });
    return ok({ formId: args.formId, status: args.status });
  },
});

export async function _deleteForm(ctx: MutationCtx, formId: Id<"forms">) {
  const [schemas, submissions] = await Promise.all([
    ctx.db
      .query("formSchemas")
      .withIndex("by_form_id", (q) => q.eq("formId", formId))
      .collect(),
    ctx.db
      .query("submissions")
      .withIndex("by_form_id", (q) => q.eq("formId", formId))
      .collect(),
  ]);

  for (const submission of submissions) {
    await _deleteSubmission(ctx, submission._id);
  }

  for (const schema of schemas) {
    await ctx.db.delete(schema._id);
  }

  await ctx.db.delete(formId);

  return ok({ formId });
}

export const deleteForm = mutation({
  args: {
    formId: v.id("forms"),
  },
  handler: async (ctx, args) => {
    const formWithAccess = await getFormAccess(ctx, args.formId);
    if (!formWithAccess.ok) return fail({ data: [], error: formWithAccess.error });

    return ok(await _deleteForm(ctx, args.formId));
  },
});

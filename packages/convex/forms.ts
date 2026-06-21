import { nano } from "@formbro/shared/nanoid";
import { fail, ok } from "@formbro/shared/result";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { getFormAccess, getWorkspaceAccess } from "./access";
import { requireWorkspaceSubscription } from "./billing";
import { getWorkspaceFormsUsed, isWorkspaceLimitReached } from "./billingUtils";
import { defineErrors, FormBroError } from "./errors";
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

    await ctx.db.insert("forms", {
      status: "draft",
      slug,
      workspaceId: args.workspaceId,
      name: args.name,
    });

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

    const publishedSchema = form.publishedSchemaId
      ? await ctx.db.get(form.publishedSchemaId)
      : null;

    return ok({
      name: form.name,
      slug: form.slug,
      status: form.status,
      schema: publishedSchema?.schema ?? null,
    });
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

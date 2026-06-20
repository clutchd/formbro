import { nano } from "@formbro/shared/nanoid";
import { fail, ok } from "@formbro/shared/result";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getWorkspaceAccess } from "./access";
import { requireWorkspaceSubscription } from "./billing";
import { defineErrors } from "./errors";

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

    if (subscriptionState.data.limits.activeForms !== null) {
      if (subscriptionState.data.limits.activeForms === 0) {
        return fail({ data: null, error: ERRORS.ACTIVE_FORM_LIMIT });
      }

      const activeForms = await ctx.db
        .query("forms")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) => q.neq(q.field("status"), "archived"))
        .take(subscriptionState.data.limits.activeForms);

      if (activeForms.length >= subscriptionState.data.limits.activeForms) {
        return fail({ data: null, error: ERRORS.ACTIVE_FORM_LIMIT });
      }
    }

    let slug = nano();

    await ctx.db.insert("forms", {
      status: "draft",
      slug,
      workspaceId: args.workspaceId,
      name: args.name,
    });

    return ok({ slug });
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

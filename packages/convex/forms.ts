import { nano } from "@formbro/core/nanoid";
import { fail, ok } from "@formbro/core/result";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getWorkspaceAccess } from "./access";
import { defineErrors } from "./errors";

export const ERRORS = defineErrors({
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

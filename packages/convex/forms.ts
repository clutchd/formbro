import { fail, ok } from "@formbro/core/result";
import { v } from "convex/values";
import { query } from "./_generated/server";
import { getWorkspaceAccess } from "./access";
import { defineErrors } from "./errors";

export const ERRORS = defineErrors({
  FORM_NOT_FOUND: {
    message: "Form not found.",
    status: "NOT_FOUND",
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

import { fail, ok } from "@formbro/shared/result";
import { type Id } from "./_generated/dataModel";
import { type MutationCtx, type QueryCtx } from "./_generated/server";
import { getUser, resolveUserProfile } from "./auth";
import { defineErrors } from "./errors";
import { ERRORS as FORM_ERRORS } from "./forms";

export const ERRORS = defineErrors({
  WORKSPACE_ACCESS_REQUIRED: {
    message: "Workspace access required.",
    status: "FORBIDDEN",
  },
});

export async function getWorkspaceAccess(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
) {
  const identity = await getUser(ctx);
  if (!identity.ok) return fail({ error: identity.error });

  const [profile, membership] = await Promise.all([
    resolveUserProfile(ctx, identity.data),
    ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) =>
        q.eq("workspaceId", workspaceId).eq("userAuthId", identity.data.subject),
      )
      .unique(),
  ]);

  if (!membership) {
    return fail({ error: ERRORS.WORKSPACE_ACCESS_REQUIRED });
  }

  return ok({ user: profile, membership });
}

export async function getFormAccess(ctx: QueryCtx | MutationCtx, formId: Id<"forms">) {
  const form = await ctx.db.get(formId);
  if (!form) return fail({ error: FORM_ERRORS.FORM_NOT_FOUND });

  const access = await getWorkspaceAccess(ctx, form.workspaceId);
  if (!access.ok) return fail({ error: access.error });

  return ok({ form, access: access.data });
}

import { fail, ok } from "@formbro/core/result";
import { type Id } from "./_generated/dataModel";
import { type MutationCtx, type QueryCtx } from "./_generated/server";
import { getUser, resolveUserProfile } from "./auth";
import { defineErrors, FormBroError } from "./errors";

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

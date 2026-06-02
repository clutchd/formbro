import { ok } from "@formbro/core/result";
import { APP_NAME } from "@formbro/shared/brand";
import { internalMutation, type MutationCtx } from "../_generated/server";
import { getAdminAccounts } from "../auth";
import { FormBroError } from "../errors";
import {
  _addWorkspaceMember,
  _createWorkspace,
  generateSlug,
  type WorkspaceMember,
} from "../workspace";

const SYSTEM_WORKSPACE_NAME = APP_NAME;
const SYSTEM_WORKSPACE_SLUG = generateSlug(SYSTEM_WORKSPACE_NAME);

export const init = internalMutation({
  args: {},
  handler: async (ctx) => {
    const admins = await getAdminAccounts(ctx);
    const owner = admins[0];

    if (!owner) {
      throw new FormBroError("INTERNAL_SERVER_ERROR", "Admin users not found.");
    }

    const workspace = await initWorkspace(ctx, owner, admins);

    if (!workspace) {
      throw new FormBroError("INTERNAL_SERVER_ERROR", "Failed to initialize system workspace.");
    }

    return ok();
  },
});

const initWorkspace = async (
  ctx: MutationCtx,
  owner: WorkspaceMember,
  admins: WorkspaceMember[],
) => {
  const existing = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", SYSTEM_WORKSPACE_SLUG))
    .unique();

  const workspaceId =
    existing?._id ??
    (
      await _createWorkspace({
        ctx,
        name: SYSTEM_WORKSPACE_NAME,
        owner,
        plan: "unlimited",
      })
    ).workspaceId;

  if (existing) {
  }

  const existingMembers = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect();
  const ownerAuthId = existing?.ownerAuthId ?? owner.authId;
  const memberAuthIds = new Set(existingMembers.map((member) => member.userAuthId));

  for (const admin of admins) {
    if (memberAuthIds.has(admin.authId)) continue;

    await _addWorkspaceMember({
      ctx,
      workspaceId,
      member: admin,
      role: ownerAuthId === admin.authId ? "owner" : "admin",
    });
  }

  return {
    workspaceId,
    slug: SYSTEM_WORKSPACE_SLUG,
  };
};

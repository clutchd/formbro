import { APP_NAME } from "@formbro/shared/brand";
import { ok } from "@formbro/shared/result";
import { internalMutation, type MutationCtx } from "../_generated/server";
import { getAdminAccounts } from "../auth";
import { defineErrors, FormBroError } from "../errors";
import {
  _addWorkspaceMember,
  _createWorkspace,
  generateSlug,
  type WorkspaceMember,
} from "../workspace";

const ERRORS = defineErrors({
  SYSTEM_OWNER_NOT_FOUND: {
    message: "System owner not found.",
    status: "INTERNAL_SERVER_ERROR",
  },
  SYSTEM_WORKSPACE_INIT_FAILED: {
    message: "Failed to initialize system workspace.",
    status: "INTERNAL_SERVER_ERROR",
  },
});

const SYSTEM_WORKSPACE_NAME = APP_NAME;
const SYSTEM_WORKSPACE_SLUG = generateSlug(SYSTEM_WORKSPACE_NAME);

export const init = internalMutation({
  args: {},
  handler: async (ctx) => {
    const admins = await getAdminAccounts(ctx);
    const owner = admins.data[0];

    if (!owner) {
      throw new FormBroError(ERRORS.SYSTEM_OWNER_NOT_FOUND);
    }

    const workspace = await initWorkspace(ctx, owner, admins.data);

    if (!workspace) {
      throw new FormBroError(ERRORS.SYSTEM_WORKSPACE_INIT_FAILED);
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

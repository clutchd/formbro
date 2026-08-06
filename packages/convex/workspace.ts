import { APP_URL } from "@formbro/shared/brand";
import { nano } from "@formbro/shared/nanoid";
import { fail, ok } from "@formbro/shared/result";
import { hasString, normalizeEmail } from "@formbro/shared/util";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { ERRORS as ACCESS_ERRORS, getWorkspaceAccess } from "./access";
import { getUser, resolveUserProfile } from "./auth";
import { getWorkspaceSubscriptionState } from "./billing";
import {
  aggregateWorkspaceSubmissions,
  getWorkspaceFormsUsed,
  getWorkspaceMonthlySubmissionPeriod,
  getWorkspaceMonthlySubmissionsUsed,
  getWorkspaceStorageUsedBytes,
  type Plan,
} from "./billingUtils";
import { defineErrors } from "./errors";
import { _deleteForm, ERRORS as FORM_ERRORS } from "./forms";
import { datetimeFormatter } from "./lib";

export const ERRORS = defineErrors({
  DELETE_WORKSPACE_PERMISSION_DENIED: {
    message: "You do not have permission to delete this workspace.",
    status: "FORBIDDEN",
  },
  WORKSPACE_NOT_FOUND: {
    message: "Workspace not found.",
    status: "NOT_FOUND",
  },
  DELETE_WORKSPACE_ACTIVE_SUBSCRIPTION: {
    message:
      "Cannot delete a workspace with an active subscription. Cancel billing first in workspace settings.",
    status: "FORBIDDEN",
  },
  EMAIL_REQUIRED: {
    message: "Enter a valid email address.",
    status: "BAD_REQUEST",
  },
  MEMBER_ALREADY_EXISTS: {
    message: "That person is already a workspace member.",
    status: "CONFLICT",
  },
  MEMBER_LIMIT_REACHED: {
    message: "This workspace has reached its member limit.",
    status: "FORBIDDEN",
  },
  INVITE_NOT_FOUND: {
    message: "Workspace invite not found.",
    status: "NOT_FOUND",
  },
  INVITE_EXPIRED: {
    message: "This workspace invite has expired.",
    status: "GONE",
  },
  INVITE_REVOKED: {
    message: "This workspace invite has been canceled.",
    status: "GONE",
  },
  INVITE_ACCEPTED: {
    message: "This workspace invite has already been accepted.",
    status: "CONFLICT",
  },
  INVITE_EMAIL_MISMATCH: {
    message: "Sign in with the email address this invite was sent to.",
    status: "FORBIDDEN",
  },
  REMOVE_OWNER_FORBIDDEN: {
    message: "Workspace owners cannot be removed.",
    status: "FORBIDDEN",
  },
});

const WORKSPACE_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function buildCanonicalPath(input: { workspaceSlug: string; formSlug?: string }) {
  if (input.formSlug) {
    return `/dashboard/${input.workspaceSlug}/${input.formSlug}`;
  }

  return `/dashboard/${input.workspaceSlug}`;
}

function buildWorkspaceInviteToken() {
  return `${nano()}${nano()}${nano()}`;
}

function buildWorkspaceInviteUrl(token: string) {
  return `${APP_URL}/invite/${encodeURIComponent(token)}`;
}

function isPendingInvite(
  invite: Pick<Doc<"workspaceInvites">, "acceptedTime" | "expiresTime" | "revokedTime">,
  now: number,
) {
  return !invite.acceptedTime && !invite.revokedTime && invite.expiresTime > now;
}

async function requireWorkspaceMember(ctx: QueryCtx | MutationCtx, workspaceId: Id<"workspaces">) {
  const access = await getWorkspaceAccess(ctx, workspaceId);
  if (!access.ok) return fail({ data: null, error: access.error });

  const workspace = await ctx.db.get(workspaceId);
  if (!workspace) return fail({ data: null, error: ERRORS.WORKSPACE_NOT_FOUND });

  return ok({ ...access.data, workspace });
}

async function getActiveMemberCount(ctx: QueryCtx | MutationCtx, workspaceId: Id<"workspaces">) {
  return (
    await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect()
  ).length;
}

async function getPendingInviteCount(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  now: number,
  excludeInviteId?: Id<"workspaceInvites">,
) {
  const invites = await ctx.db
    .query("workspaceInvites")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect();

  return invites.filter((invite) => invite._id !== excludeInviteId && isPendingInvite(invite, now))
    .length;
}

async function hasWorkspaceMemberSeat(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  now: number,
  excludeInviteId?: Id<"workspaceInvites">,
) {
  const subscriptionState = await getWorkspaceSubscriptionState(ctx, workspaceId);
  if (!subscriptionState.ok) return fail({ data: false, error: subscriptionState.error });

  const memberLimit = subscriptionState.data.limits.members;
  if (memberLimit === null) return ok(true);

  const [activeMembers, pendingInvites] = await Promise.all([
    getActiveMemberCount(ctx, workspaceId),
    getPendingInviteCount(ctx, workspaceId, now, excludeInviteId),
  ]);

  return ok(activeMembers + pendingInvites < memberLimit);
}

export const context = query({
  args: {
    workspaceSlug: v.optional(v.string()),
    formSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await getUser(ctx);
    if (!identity.ok) return fail({ data: null, error: identity.error });

    let workspace: Doc<"workspaces"> | null = null;
    let form: Doc<"forms"> | null = null;

    if (args.formSlug) {
      if (!args.workspaceSlug) {
        return fail({ data: null, error: ERRORS.WORKSPACE_NOT_FOUND });
      }

      const workspaceSlug = args.workspaceSlug;
      workspace = await ctx.db
        .query("workspaces")
        .withIndex("by_slug", (q) => q.eq("slug", workspaceSlug))
        .unique();
      if (!workspace) return fail({ data: null, error: ERRORS.WORKSPACE_NOT_FOUND });

      const formSlug = args.formSlug;
      const workspaceId = workspace._id;
      form = await ctx.db
        .query("forms")
        .withIndex("by_workspace_and_slug", (q) =>
          q.eq("workspaceId", workspaceId).eq("slug", formSlug),
        )
        .unique();
      if (!form) return fail({ data: null, error: FORM_ERRORS.FORM_NOT_FOUND });
    } else if (args.workspaceSlug) {
      const workspaceSlug = args.workspaceSlug;
      workspace = await ctx.db
        .query("workspaces")
        .withIndex("by_slug", (q) => q.eq("slug", workspaceSlug))
        .unique();
      if (!workspace) return fail({ data: null, error: ERRORS.WORKSPACE_NOT_FOUND });
    } else {
      return fail({ data: null, error: ERRORS.WORKSPACE_NOT_FOUND });
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) =>
        q.eq("workspaceId", workspace._id).eq("userAuthId", identity.data.subject),
      )
      .unique();
    if (!membership) return fail({ data: null, error: ACCESS_ERRORS.WORKSPACE_ACCESS_REQUIRED });

    const canonicalPath = buildCanonicalPath({
      workspaceSlug: workspace.slug,
      formSlug: form?.slug,
    });

    const sameWorkspaceSlug =
      args.workspaceSlug === undefined || args.workspaceSlug === workspace.slug;
    const sameFormSlug = args.formSlug === undefined || args.formSlug === form?.slug;

    return ok({
      workspace: {
        ...workspace,
        role: membership.role,
      },
      form: form ?? undefined,
      canonicalPath,
      isCanonical: sameWorkspaceSlug && sameFormSlug,
    });
  },
});

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
}

export type WorkspaceMember = {
  authId: string;
  email: string;
  name: string;
  avatarUrl?: string;
};

export async function _createWorkspace({
  ctx,
  name,
  owner,
  plan,
}: {
  ctx: MutationCtx;
  name: string;
  owner: WorkspaceMember;
  plan?: Plan | "unlimited";
}) {
  const baseSlug = generateSlug(name) || nano();
  let slug = baseSlug;
  let existingWithSlug = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();

  let counter = 1;
  while (existingWithSlug) {
    slug = `${baseSlug}-${counter}`;
    existingWithSlug = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    counter++;
  }

  const workspaceId = await ctx.db.insert("workspaces", {
    name,
    slug,
    ownerAuthId: owner.authId,
    plan,
    billingStatus: plan === "unlimited" ? "active" : "not_subscribed",
  });

  await _addWorkspaceMember({
    ctx,
    workspaceId,
    member: owner,
    role: "owner",
  });

  return {
    workspaceId,
    slug,
  };
}

export async function _addWorkspaceMember({
  ctx,
  workspaceId,
  member,
  role,
}: {
  ctx: MutationCtx;
  workspaceId: Id<"workspaces">;
  member: WorkspaceMember;
  role: "owner" | "admin" | "member";
}) {
  await ctx.db.insert("workspaceMembers", {
    workspaceId,
    userAuthId: member.authId,
    userEmail: normalizeEmail(member.email),
    userName: member.name,
    userAvatarUrl: member.avatarUrl,
    role,
  });
}

export const syncMemberAvatar = internalMutation({
  args: {
    userAuthId: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const image = hasString(args.image) ? args.image : undefined;
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userAuthId", args.userAuthId))
      .filter((q) => q.neq(q.field("userAvatarUrl"), image))
      .collect();

    await Promise.all(
      memberships.map((membership) => ctx.db.patch(membership._id, { userAvatarUrl: image })),
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await getUser(ctx);
    if (!identity.ok) return fail({ data: undefined, error: identity.error });

    const profile = await resolveUserProfile(ctx, identity.data);

    return ok(
      await _createWorkspace({
        ctx,
        name: args.name,
        owner: {
          authId: identity.data.subject,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.image,
        },
      }),
    );
  },
});

export const deleteWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userWithAccess = await getWorkspaceAccess(ctx, args.workspaceId);
    if (!userWithAccess.ok) {
      return fail({ data: null, error: userWithAccess.error });
    }

    if (userWithAccess.data.membership.role !== "owner") {
      return fail({ data: null, error: ERRORS.DELETE_WORKSPACE_PERMISSION_DENIED });
    }

    const subscriptionState = await getWorkspaceSubscriptionState(ctx, args.workspaceId);
    if (subscriptionState.ok && !subscriptionState.data.canDelete) {
      return fail({ data: null, error: ERRORS.DELETE_WORKSPACE_ACTIVE_SUBSCRIPTION });
    }

    // Delete all workspace members
    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // Delete all workspace forms
    const forms = await ctx.db
      .query("forms")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    for (const form of forms) {
      await _deleteForm(ctx, form._id);
    }

    await ctx.db.delete(args.workspaceId);

    return ok({ workspaceId: args.workspaceId });
  },
});

export const get = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userWithAccess = await getWorkspaceAccess(ctx, args.workspaceId);
    if (!userWithAccess.ok) {
      return fail({ data: null, error: userWithAccess.error });
    }

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) return fail({ data: null, error: ERRORS.WORKSPACE_NOT_FOUND });
    return ok({ ...workspace, role: userWithAccess.data.membership.role });
  },
});

export const listMembers = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userWithAccess = await getWorkspaceAccess(ctx, args.workspaceId);
    if (!userWithAccess.ok) {
      return fail({ data: [], error: userWithAccess.error });
    }

    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const roleOrder = { owner: 0, admin: 1, member: 2 } as const;

    return ok(
      members
        .sort((left, right) => {
          const roleDiff = roleOrder[left.role] - roleOrder[right.role];
          if (roleDiff !== 0) return roleDiff;
          return left.userName.localeCompare(right.userName);
        })
        .map((member) => ({
          _id: member._id,
          name: member.userName,
          email: member.userEmail,
          avatarUrl: member.userAvatarUrl,
          role: member.role,
        })),
    );
  },
});

export const listInvites = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const access = await getWorkspaceAccess(ctx, args.workspaceId);
    if (!access.ok) return fail({ data: [], error: access.error });

    const now = Date.now();
    const invites = await ctx.db
      .query("workspaceInvites")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return ok(
      invites
        .filter((invite) => isPendingInvite(invite, now))
        .sort((left, right) => right.createdTime - left.createdTime)
        .map((invite) => ({
          _id: invite._id,
          email: invite.email,
          createdTime: invite.createdTime,
          expiresTime: invite.expiresTime,
        })),
    );
  },
});

export const getInvite = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("workspaceInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invite) return fail({ data: null, error: ERRORS.INVITE_NOT_FOUND });

    const workspace = await ctx.db.get(invite.workspaceId);
    if (!workspace) return fail({ data: null, error: ERRORS.WORKSPACE_NOT_FOUND });

    const now = Date.now();
    const status = invite.acceptedTime
      ? "accepted"
      : invite.revokedTime
        ? "revoked"
        : invite.expiresTime <= now
          ? "expired"
          : "pending";

    return ok({
      email: invite.email,
      expiresTime: invite.expiresTime,
      status,
      workspaceName: workspace.name,
      workspaceSlug: workspace.slug,
    });
  },
});

export const inviteMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const workspaceAccess = await requireWorkspaceMember(ctx, args.workspaceId);
    if (!workspaceAccess.ok) return fail({ data: null, error: workspaceAccess.error });

    const email = normalizeEmail(args.email);
    if (!hasString(email)) return fail({ data: null, error: ERRORS.EMAIL_REQUIRED });

    const existingMember = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_email", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userEmail", email),
      )
      .unique();

    if (existingMember) return fail({ data: null, error: ERRORS.MEMBER_ALREADY_EXISTS });

    const now = Date.now();
    const hasSeat = await hasWorkspaceMemberSeat(ctx, args.workspaceId, now);
    if (!hasSeat.ok) return fail({ data: null, error: hasSeat.error });
    if (!hasSeat.data) return fail({ data: null, error: ERRORS.MEMBER_LIMIT_REACHED });

    const previousInvites = await ctx.db
      .query("workspaceInvites")
      .withIndex("by_workspace_and_email", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("email", email),
      )
      .collect();

    await Promise.all(
      previousInvites
        .filter((invite) => isPendingInvite(invite, now))
        .map((invite) => ctx.db.patch(invite._id, { revokedTime: now })),
    );

    const token = buildWorkspaceInviteToken();
    const expiresTime = now + WORKSPACE_INVITE_TTL_MS;
    const inviteId = await ctx.db.insert("workspaceInvites", {
      workspaceId: args.workspaceId,
      email,
      token,
      invitedBy: workspaceAccess.data.membership._id,
      createdTime: now,
      expiresTime,
    });

    await ctx.scheduler.runAfter(0, api.emails.transactional, {
      email: {
        template: "workspaceInvite",
        to: email,
        workspaceName: workspaceAccess.data.workspace.name,
        inviterName: workspaceAccess.data.user.name,
        acceptUrl: buildWorkspaceInviteUrl(token),
        expiresTime,
      },
    });

    return ok({
      _id: inviteId,
      email,
      createdTime: now,
      expiresTime,
    });
  },
});

export const cancelInvite = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    inviteId: v.id("workspaceInvites"),
  },
  handler: async (ctx, args) => {
    const workspaceAccess = await requireWorkspaceMember(ctx, args.workspaceId);
    if (!workspaceAccess.ok) return fail({ data: null, error: workspaceAccess.error });

    const invite = await ctx.db.get(args.inviteId);
    if (!invite || invite.workspaceId !== args.workspaceId) {
      return fail({ data: null, error: ERRORS.INVITE_NOT_FOUND });
    }

    const revokedTime = Date.now();
    await ctx.db.patch(invite._id, { revokedTime });
    return ok({ inviteId: invite._id, revokedTime });
  },
});

export const acceptInvite = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const identity = await getUser(ctx);
    if (!identity.ok) return fail({ data: null, error: identity.error });

    const invite = await ctx.db
      .query("workspaceInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invite) return fail({ data: null, error: ERRORS.INVITE_NOT_FOUND });
    if (invite.revokedTime) return fail({ data: null, error: ERRORS.INVITE_REVOKED });
    if (invite.acceptedTime) return fail({ data: null, error: ERRORS.INVITE_ACCEPTED });

    const now = Date.now();
    if (invite.expiresTime <= now) return fail({ data: null, error: ERRORS.INVITE_EXPIRED });

    const workspace = await ctx.db.get(invite.workspaceId);
    if (!workspace) return fail({ data: null, error: ERRORS.WORKSPACE_NOT_FOUND });

    const profile = await resolveUserProfile(ctx, identity.data);
    if (normalizeEmail(profile.email) !== invite.email) {
      return fail({ data: null, error: ERRORS.INVITE_EMAIL_MISMATCH });
    }

    const existingMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) =>
        q.eq("workspaceId", invite.workspaceId).eq("userAuthId", identity.data.subject),
      )
      .unique();

    if (!existingMembership) {
      const hasSeat = await hasWorkspaceMemberSeat(ctx, invite.workspaceId, now, invite._id);
      if (!hasSeat.ok) return fail({ data: null, error: hasSeat.error });
      if (!hasSeat.data) return fail({ data: null, error: ERRORS.MEMBER_LIMIT_REACHED });

      await _addWorkspaceMember({
        ctx,
        workspaceId: invite.workspaceId,
        member: {
          authId: identity.data.subject,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.image,
        },
        role: "member",
      });
    }

    await ctx.db.patch(invite._id, { acceptedTime: now });

    return ok({
      workspaceId: workspace._id,
      workspaceSlug: workspace.slug,
    });
  },
});

export const removeMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    memberId: v.id("workspaceMembers"),
  },
  handler: async (ctx, args) => {
    const workspaceAccess = await requireWorkspaceMember(ctx, args.workspaceId);
    if (!workspaceAccess.ok) return fail({ data: null, error: workspaceAccess.error });

    const member = await ctx.db.get(args.memberId);
    if (!member || member.workspaceId !== args.workspaceId) {
      return fail({ data: null, error: ACCESS_ERRORS.WORKSPACE_ACCESS_REQUIRED });
    }

    if (member.role === "owner") {
      return fail({ data: null, error: ERRORS.REMOVE_OWNER_FORBIDDEN });
    }

    await ctx.db.delete(member._id);
    return ok({ memberId: member._id });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user.ok) return fail({ data: [], error: user.error });

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userAuthId", user.data.subject))
      .collect();

    const workspaces = await Promise.all(
      memberships.map(async (membership) => {
        const [workspace, forms] = await Promise.all([
          ctx.db.get(membership.workspaceId),
          ctx.db
            .query("forms")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", membership.workspaceId))
            .filter((q) => q.neq(q.field("status"), "archived"))
            .collect(),
        ]);

        if (!workspace) return null;

        return { ...workspace, role: membership.role, forms };
      }),
    );

    return ok(workspaces.filter((workspace) => workspace !== null));
  },
});

export const linkStripeCustomer = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.workspaceId, { stripeCustomerId: args.stripeCustomerId });
    return ok({ workspaceId: args.workspaceId, stripeCustomerId: args.stripeCustomerId });
  },
});

export const billing = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userWithAccess = await getWorkspaceAccess(ctx, args.workspaceId);
    if (!userWithAccess.ok) {
      return fail({ data: undefined, error: userWithAccess.error });
    }

    const subscriptionState = await getWorkspaceSubscriptionState(ctx, args.workspaceId);
    if (!subscriptionState.ok) {
      return fail({ data: undefined, error: subscriptionState.error });
    }

    const monthlySubmissionPeriod = getWorkspaceMonthlySubmissionPeriod(
      subscriptionState.data.subscription,
    );

    const [formsUsed, monthlySubmissionsUsed, storageUsedBytes] = await Promise.all([
      getWorkspaceFormsUsed(ctx, args.workspaceId),
      getWorkspaceMonthlySubmissionsUsed(ctx, args.workspaceId, monthlySubmissionPeriod),
      getWorkspaceStorageUsedBytes(ctx, args.workspaceId),
    ]);

    return ok({
      workspaceId: subscriptionState.data.workspace._id,
      plan: subscriptionState.data.plan,
      planLabel: subscriptionState.data.planLabel,
      limits: subscriptionState.data.limits,
      usage: {
        forms: formsUsed,
        monthlySubmissions: monthlySubmissionsUsed,
        monthlySubmissionPeriod,
        storageBytes: storageUsedBytes,
      },
      hasActiveSubscription: subscriptionState.data.hasActiveSubscription,
      canManageBilling: userWithAccess.data.membership.role === "owner",
      canDelete: subscriptionState.data.canDelete,
    });
  },
});

export const metrics = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const access = await getWorkspaceAccess(ctx, args.workspaceId);
    if (!access.ok) return fail({ data: null, error: access.error });

    const stats = await aggregateWorkspaceSubmissions(ctx, args.workspaceId);
    return ok(Object.fromEntries(stats.byForm));
  },
});

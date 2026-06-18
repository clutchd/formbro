import { fail, ok } from "@formbro/shared/result";
import { hasString, normalizeEmail } from "@formbro/shared/util";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { Plan } from "./billingUtils";
import { internalMutation, mutation, query, type MutationCtx } from "./_generated/server";
import { ERRORS as ACCESS_ERRORS, getWorkspaceAccess } from "./access";
import { getUser, resolveUserProfile } from "./auth";
import { getWorkspaceSubscriptionState } from "./billing";
import { defineErrors } from "./errors";
import { ERRORS as FORM_ERRORS } from "./forms";

export const ERRORS = defineErrors({
  DELETE_WORKSPACE_PERMISSION_DENIED: {
    message: "You do not have permission to delete this workspace.",
    status: "FORBIDDEN",
  },
  WORKSPACE_NOT_FOUND: {
    message: "Workspace not found.",
    status: "NOT_FOUND",
  },
  UNPAID_WORKSPACE_LIMIT: {
    message: "Unpaid workspace limit reached.",
    status: "FORBIDDEN",
  },
  DELETE_WORKSPACE_ACTIVE_SUBSCRIPTION: {
    message:
      "Cannot delete a workspace with an active subscription. Cancel billing first in workspace settings.",
    status: "FORBIDDEN",
  },
});

function buildCanonicalPath(input: { workspaceSlug: string; formId?: string }) {
  if (input.formId) {
    return `/dashboard/${input.workspaceSlug}/${input.formId}`;
  }

  return `/dashboard/${input.workspaceSlug}`;
}

export const context = query({
  args: {
    workspaceSlug: v.optional(v.string()),
    formId: v.optional(v.id("forms")),
  },
  handler: async (ctx, args) => {
    const identity = await getUser(ctx);
    if (!identity.ok) return fail({ data: null, error: identity.error });

    let workspace: Doc<"workspaces"> | null = null;
    let form: Doc<"forms"> | null = null;

    if (args.formId) {
      form = await ctx.db.get(args.formId);
      if (!form) return fail({ data: null, error: FORM_ERRORS.FORM_NOT_FOUND });

      workspace = await ctx.db.get(form.workspaceId);
      if (!workspace) return fail({ data: null, error: ERRORS.WORKSPACE_NOT_FOUND });
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
      formId: form?._id,
    });

    const sameWorkspaceSlug =
      args.workspaceSlug === undefined || args.workspaceSlug === workspace.slug;
    const sameFormId = args.formId === undefined || args.formId === form?._id;

    return ok({
      workspace: {
        ...workspace,
        role: membership.role,
      },
      form: form ?? undefined,
      canonicalPath,
      isCanonical: sameWorkspaceSlug && sameFormId,
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
  let slug = generateSlug(name);
  let existingWithSlug = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();

  let counter = 1;
  while (existingWithSlug) {
    slug = `${generateSlug(name)}-${counter}`;
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

    const unpaidWorkspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerAuthId", identity.data.subject))
      .filter(
        (q) => q.eq(q.field("billingStatus"), "not_subscribed") || q.eq(q.field("plan"), undefined),
      )
      .collect();

    if (unpaidWorkspaces.length > 0) {
      return fail({ data: undefined, error: ERRORS.UNPAID_WORKSPACE_LIMIT });
    }

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
      await ctx.db.delete(form._id);
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

    // const storageUsedBytes = await getTeamStorageUsedBytes(ctx, args.teamId);
    // const subscription = subscriptionState.subscription;

    return ok({
      workspaceId: subscriptionState.data.workspace._id,
      plan: subscriptionState.data.plan,
      planLabel: subscriptionState.data.planLabel,
      limits: subscriptionState.data.limits,
      // monthlyPriceUsd: TEAM_PLAN_MONTHLY_PRICE_USD[subscriptionState.plan],
      // storageLimitBytes: TEAM_PLAN_STORAGE_LIMIT_BYTES[subscriptionState.plan],
      // storageUsedBytes,
      hasActiveSubscription: subscriptionState.data.hasActiveSubscription,
      // subscriptionStatus:
      //   subscription?.status ?? subscriptionState.team.billingStatus ?? null,
      // stripeCustomerId:
      //   subscriptionState.team.stripeCustomerId ??
      //   subscription?.stripeCustomerId ??
      //   null,
      // stripeSubscriptionId:
      //   subscription?.stripeSubscriptionId ??
      //   subscriptionState.team.stripeSubscriptionId ??
      //   null,
      // stripePriceId: subscription?.priceId ?? subscriptionState.team.stripePriceId ?? null,
      // currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
      // role: membership.role,
      canManageBilling: userWithAccess.data.membership.role === "owner",
      canDelete: subscriptionState.data.canDelete,
    });
  },
});

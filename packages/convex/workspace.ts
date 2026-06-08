import { error, fail, ok } from "@formbro/core/result";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation, mutation, query, type MutationCtx } from "./_generated/server";
import { getUser, requireUser, userProfileFromIdentity } from "./auth";
import { hasString, normalizeEmail, type Plan } from "./lib";

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
    const user = await getUser(ctx);
    if (!user) return fail(null);

    let workspace: Doc<"workspaces"> | null = null;
    let form: Doc<"forms"> | null = null;

    if (args.formId) {
      form = await ctx.db.get(args.formId);
      if (!form) return fail(null);

      workspace = await ctx.db.get(form.workspaceId);
      if (!workspace) return fail(null);
    } else if (args.workspaceSlug) {
      const workspaceSlug = args.workspaceSlug;
      workspace = await ctx.db
        .query("workspaces")
        .withIndex("by_slug", (q) => q.eq("slug", workspaceSlug))
        .unique();
      if (!workspace) return fail(null);
    } else {
      return fail(null);
    }

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_user", (q) =>
        q.eq("workspaceId", workspace._id).eq("userAuthId", user.subject),
      )
      .unique();
    if (!membership) return fail(null);

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
    const user = await requireUser(ctx);
    const profile = await userProfileFromIdentity(ctx, user);

    const unpaidWorkspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerAuthId", user.subject))
      .filter(
        (q) => q.eq(q.field("billingStatus"), "not_subscribed") || q.eq(q.field("plan"), undefined),
      )
      .collect();

    if (unpaidWorkspaces.length > 0) {
      return error({
        code: "UNPAID_WORKSPACE_LIMIT",
        message: "You can only have one unpaid workspace at a time",
        status: "CONFLICT",
      });
    }

    return ok(
      await _createWorkspace({
        ctx,
        name: args.name,
        owner: {
          authId: user.subject,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.image,
        },
      }),
    );
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return fail([]);

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userAuthId", user.subject))
      .collect();

    const workspaces = await Promise.all(
      memberships.map(async (membership) => {
        const workspace = await ctx.db.get(membership.workspaceId);
        return workspace ? { ...workspace, role: membership.role } : null;
      }),
    );

    return ok(workspaces.filter((w): w is NonNullable<typeof w> => Boolean(w)));
  },
});

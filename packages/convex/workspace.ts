import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import {
  getUser,
  identityAvatarUrl,
  identityEmail,
  identityName,
  requireUser,
  requireWorkspaceAccess,
} from "./auth";
import { FormBroError } from "./errors";

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
    if (!user) return null;

    let workspace: Doc<"workspaces"> | null = null;
    let form: Doc<"forms"> | null = null;

    if (args.formId) {
      form = await ctx.db.get(args.formId);
      if (!form) return null;

      workspace = await ctx.db.get(form.workspaceId);
      if (!workspace) return null;
    } else if (args.workspaceSlug) {
      const workspaceSlug = args.workspaceSlug;
      workspace = await ctx.db
        .query("workspaces")
        .withIndex("by_slug", (q) => q.eq("slug", workspaceSlug))
        .unique();
      if (!workspace) return null;
    } else {
      return null;
    }

    const { membership } = await requireWorkspaceAccess(ctx, workspace._id);
    if (!membership) return null;

    const canonicalPath = buildCanonicalPath({
      workspaceSlug: workspace.slug,
      formId: form?._id,
    });

    const sameWorkspaceSlug =
      args.workspaceSlug === undefined || args.workspaceSlug === workspace.slug;
    const sameFormId = args.formId === undefined || args.formId === form?._id;

    return {
      workspace: {
        ...workspace,
        role: membership.role,
      },
      form: form ?? undefined,
      canonicalPath,
      isCanonical: sameWorkspaceSlug && sameFormId,
    };
  },
});

function normalizedEmail(value: string) {
  return value.trim().toLowerCase();
}

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
  plan?: "hobby" | "standard" | "pro" | "unlimited";
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
    billingStatus: "not_subscribed",
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
    userEmail: normalizedEmail(member.email),
    userName: member.name,
    userAvatarUrl: member.avatarUrl,
    role,
  });
}

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const unpaidWorkspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerAuthId", user.subject))
      .filter(
        (q) => q.eq(q.field("billingStatus"), "not_subscribed") || q.eq(q.field("plan"), undefined),
      )
      .collect();

    if (unpaidWorkspaces.length > 0) {
      throw new FormBroError("CONFLICT", {
        message: "You can only have one unpaid workspace at a time",
      });
    }

    return await _createWorkspace({
      ctx,
      name: args.name,
      owner: {
        authId: user.subject,
        email: identityEmail(user),
        name: identityName(user),
        avatarUrl: identityAvatarUrl(user),
      },
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return [];

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

    return workspaces.filter((w): w is NonNullable<typeof w> => Boolean(w));
  },
});

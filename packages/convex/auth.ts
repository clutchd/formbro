import type { FunctionArgs, PaginationResult } from "convex/server";
import { createClient, type AuthFunctions, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { fail, ok } from "@formbro/core/result";
import { APP_URL } from "@formbro/shared/brand";
import { betterAuth } from "better-auth/minimal";
import type { DataModel, Id } from "./_generated/dataModel";
import type { Doc as BetterAuthDoc } from "./node_modules/@convex-dev/better-auth/src/component/_generated/dataModel";
import { api, components, internal } from "./_generated/api";
import { query, type ActionCtx, type MutationCtx, type QueryCtx } from "./_generated/server";
import authConfig from "./auth.config";
import { FormBroError } from "./errors";

export type Identity = NonNullable<Awaited<ReturnType<QueryCtx["auth"]["getUserIdentity"]>>>;

function hasString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function getOptionalString(identity: Identity, key: string): string | undefined {
  const value = (identity as Record<string, unknown>)[key];
  return hasString(value) ? value : undefined;
}

export function identityName(identity: Identity): string {
  const name = getOptionalString(identity, "name");
  if (name) return name;

  const firstName = getOptionalString(identity, "firstName");
  const lastName = getOptionalString(identity, "lastName");
  if (firstName && lastName) return `${firstName} ${lastName}`;

  const email = getOptionalString(identity, "email");
  if (email) return email;

  return "Unknown";
}

export function identityEmail(identity: Identity): string {
  return getOptionalString(identity, "email") ?? "";
}

export function identityAvatarUrl(identity: Identity): string | undefined {
  return getOptionalString(identity, "pictureUrl");
}

export async function getUser(ctx: QueryCtx | MutationCtx) {
  return await ctx.auth.getUserIdentity();
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await getUser(ctx);
  if (!identity) {
    throw new FormBroError("UNAUTHORIZED", "Not authenticated.");
  }
  return identity;
}

export function getAdminEmails() {
  if (!process.env.ADMIN) {
    throw new FormBroError("INTERNAL_SERVER_ERROR", "Admin access is not set.");
  }

  return process.env.ADMIN.split(",").map(normalizeEmail).filter(hasString);
}

export async function getAdminAccounts(ctx: QueryCtx | MutationCtx) {
  const adminEmails = getAdminEmails();
  const admins: Array<{ authId: string; email: string; name: string; avatarUrl?: string }> = [];

  for (const email of adminEmails) {
    const admin = await adapterFindOne(ctx, {
      model: "user",
      where: [{ field: "email", operator: "eq", value: email }],
    });

    if (admin) {
      admins.push({
        authId: String(admin._id),
        email: admin.email,
        name: admin.name,
        avatarUrl: admin.image ?? undefined,
      });
    }
  }

  return admins;
}

export async function getAdminUser(ctx: QueryCtx | MutationCtx) {
  const identity = await getUser(ctx);
  if (!identity) return null;

  const email = identityEmail(identity);
  if (!email) return null;

  if (!getAdminEmails().includes(normalizeEmail(email))) {
    return null;
  }

  return identity;
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await getAdminUser(ctx);
  if (!identity) {
    throw new FormBroError("UNAUTHORIZED", "Admin access required.");
  }
  return identity;
}

export async function requireWorkspaceAccess(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
) {
  const user = await requireUser(ctx);

  const membership = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_and_user", (q) =>
      q.eq("workspaceId", workspaceId).eq("userAuthId", user.subject),
    )
    .unique();

  if (!membership) {
    throw new FormBroError("FORBIDDEN", "Workspace access required.");
  }

  return { user, membership };
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getUser(ctx);
    if (!identity) return fail(null);

    return ok({
      name: identityName(identity),
      email: identityEmail(identity),
      image: identityAvatarUrl(identity),
    });
  },
});

export const getAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getAdminUser(ctx);
    if (!identity) return fail(null);

    return ok({
      name: identityName(identity),
      email: identityEmail(identity),
      image: identityAvatarUrl(identity),
    });
  },
});

const functions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions: functions,
  triggers: {
    user: {
      onCreate: async (ctx, doc) => {
        await ctx.scheduler.runAfter(0, api.resend.audience.add, {
          email: doc.email,
          name: doc.name,
        });
        await ctx.scheduler.runAfter(0, api.resend.emails.send, {
          email: {
            template: "welcome",
            to: doc.email,
          },
        });
      },
      onUpdate: async (ctx, doc) => {
        await ctx.scheduler.runAfter(0, api.resend.audience.update, {
          email: doc.email,
          name: doc.name,
        });
      },
    },
  },
});

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: APP_URL,
    trustedOrigins: [
      "https://formbro.com",
      "https://api.formbro.com",
      "https://db.formbro.com",
      "https://canary.formbro.com",
      "http://localhost:3000",
    ],
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
      microsoft: {
        clientId: process.env.MICROSOFT_CLIENT_ID as string,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        tenantId: "common",
      },
    },
    database: authComponent.adapter(ctx),
    plugins: [convex({ authConfig })],
  });
};

type MutationCtxLike = MutationCtx | ActionCtx;
type QueryCtxLike = QueryCtx | MutationCtx | ActionCtx;

export const adapterCreate = async <
  TArgs extends FunctionArgs<typeof components.betterAuth.adapter.create>,
>(
  ctx: MutationCtxLike,
  args: TArgs,
) => {
  return (await ctx.runMutation(components.betterAuth.adapter.create, args)) as BetterAuthDoc<
    TArgs["input"]["model"]
  >;
};

export const adapterFindMany = async <
  TArgs extends FunctionArgs<typeof components.betterAuth.adapter.findMany>,
>(
  ctx: QueryCtxLike,
  args: TArgs,
) => {
  return (await ctx.runQuery(components.betterAuth.adapter.findMany, args)) as PaginationResult<
    BetterAuthDoc<TArgs["model"]>
  >;
};

export const adapterFindOne = async <
  TArgs extends FunctionArgs<typeof components.betterAuth.adapter.findOne>,
>(
  ctx: QueryCtxLike,
  args: TArgs,
) => {
  return (await ctx.runQuery(components.betterAuth.adapter.findOne, args)) as BetterAuthDoc<
    TArgs["model"]
  > | null;
};

export const adapterUpdateOne = async <
  TArgs extends FunctionArgs<typeof components.betterAuth.adapter.updateOne>,
>(
  ctx: MutationCtxLike,
  args: TArgs,
) => {
  return (await ctx.runMutation(components.betterAuth.adapter.updateOne, args)) as
    | BetterAuthDoc<TArgs["input"]["model"]>
    | null
    | undefined;
};

export const adapterUpdateMany = async <
  TArgs extends FunctionArgs<typeof components.betterAuth.adapter.updateMany>,
>(
  ctx: MutationCtxLike,
  args: TArgs,
) => {
  return (await ctx.runMutation(
    components.betterAuth.adapter.updateMany,
    args,
  )) as PaginationResult<BetterAuthDoc<TArgs["input"]["model"]>>;
};

export const adapterDeleteOne = async <
  TArgs extends FunctionArgs<typeof components.betterAuth.adapter.deleteOne>,
>(
  ctx: MutationCtxLike,
  args: TArgs,
) => {
  return (await ctx.runMutation(components.betterAuth.adapter.deleteOne, args)) as
    | BetterAuthDoc<TArgs["input"]["model"]>
    | null
    | undefined;
};

export const adapterDeleteMany = async <
  TArgs extends FunctionArgs<typeof components.betterAuth.adapter.deleteMany>,
>(
  ctx: MutationCtxLike,
  args: TArgs,
) => {
  return (await ctx.runMutation(
    components.betterAuth.adapter.deleteMany,
    args,
  )) as PaginationResult<BetterAuthDoc<TArgs["input"]["model"]>>;
};

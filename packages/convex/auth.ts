import type { FunctionArgs, PaginationResult } from "convex/server";
import { createClient, type AuthFunctions, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { fail, ok } from "@formbro/core/result";
import { hasString, normalizeEmail } from "@formbro/core/util";
import { APP_URL } from "@formbro/shared/brand";
import { betterAuth } from "better-auth/minimal";
import type { DataModel } from "./_generated/dataModel";
import type { Doc as BetterAuthDoc } from "./node_modules/@convex-dev/better-auth/src/component/_generated/dataModel";
import { api, components, internal } from "./_generated/api";
import { query, type ActionCtx, type MutationCtx, type QueryCtx } from "./_generated/server";
import authConfig from "./auth.config";
import { FormBroError, defineErrors } from "./errors";

export const ERRORS = defineErrors({
  ADMIN_REQUIRED: {
    message: "Admin access required.",
    status: "FORBIDDEN",
  },
  ADMIN_USERS_NOT_CONFIGURED: {
    message: "Admin users are not configured.",
    status: "INTERNAL_SERVER_ERROR",
  },
  NOT_AUTHENTICATED: {
    message: "Not authenticated.",
    status: "UNAUTHORIZED",
  },
});

type Identity = NonNullable<Awaited<ReturnType<QueryCtx["auth"]["getUserIdentity"]>>>;

function getOptionalString(identity: Identity, key: string): string | undefined {
  const value = (identity as Record<string, unknown>)[key];
  return hasString(value) ? value : undefined;
}

function identityName(identity: Identity): string {
  const name = getOptionalString(identity, "name");
  if (name) return name;

  const firstName = getOptionalString(identity, "firstName");
  const lastName = getOptionalString(identity, "lastName");
  if (firstName && lastName) return `${firstName} ${lastName}`;

  const email = getOptionalString(identity, "email");
  if (email) return email;

  return "Unknown";
}

function identityEmail(identity: Identity): string {
  return getOptionalString(identity, "email") ?? "";
}

function identityAvatarUrl(identity: Identity): string | undefined {
  return getOptionalString(identity, "image");
}

export async function resolveUserProfile(ctx: QueryCtxLike, identity: Identity) {
  const storedUser = await authComponent.getAnyUserById(ctx, identity.subject);

  return {
    name: hasString(storedUser?.name) ? storedUser.name : identityName(identity),
    email: hasString(storedUser?.email) ? storedUser.email : identityEmail(identity),
    image: hasString(storedUser?.image) ? storedUser.image : identityAvatarUrl(identity),
  };
}

export async function getUser(ctx: QueryCtx | MutationCtx) {
  const user = await ctx.auth.getUserIdentity();
  if (!user) return fail({ error: ERRORS.NOT_AUTHENTICATED });
  return ok(user);
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await getUser(ctx);
  if (!identity.ok) {
    throw new FormBroError(identity.error);
  }
  return ok(identity.data);
}

function getAdminEmails() {
  if (!process.env.ADMIN) {
    throw new FormBroError(ERRORS.ADMIN_USERS_NOT_CONFIGURED);
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

  return ok(admins);
}

function isAdminIdentity(identity: Identity): boolean {
  const email = identityEmail(identity);
  if (!email) return false;
  return getAdminEmails().includes(normalizeEmail(email));
}

export async function getAdminUser(ctx: QueryCtx | MutationCtx) {
  const identity = await getUser(ctx);
  if (!identity.ok) return fail({ error: identity.error });
  if (!isAdminIdentity(identity.data)) return fail({ error: ERRORS.ADMIN_REQUIRED });
  return ok(identity.data);
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await getAdminUser(ctx);
  if (!identity.ok) {
    throw new FormBroError(identity.error);
  }
  return ok(identity.data);
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getUser(ctx);
    if (!identity.ok) return fail({ data: null, error: identity.error });
    return ok(await resolveUserProfile(ctx, identity.data));
  },
});

export const getAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getAdminUser(ctx);
    if (!identity.ok) return fail({ data: null, error: identity.error });
    return ok(await resolveUserProfile(ctx, identity.data));
  },
});

const functions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions: functions,
  triggers: {
    user: {
      onCreate: async (ctx, doc) => {
        await ctx.scheduler.runAfter(0, api.audience.add, {
          email: doc.email,
          name: doc.name,
        });
        await ctx.scheduler.runAfter(0, api.emails.transactional, {
          email: {
            template: "welcome",
            to: doc.email,
          },
        });
      },
      onUpdate: async (ctx, doc) => {
        await ctx.scheduler.runAfter(0, internal.workspace.syncMemberAvatar, {
          userAuthId: String(doc._id),
          image: hasString(doc.image) ? doc.image : undefined,
        });
        await ctx.scheduler.runAfter(0, api.audience.update, {
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
        mapProfileToUser: (profile) => ({ image: profile.picture }),
        overrideUserInfoOnSignIn: true,
      },
      microsoft: {
        clientId: process.env.MICROSOFT_CLIENT_ID as string,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        tenantId: process.env.MICROSOFT_TENANT_ID ?? "common",
        prompt: "select_account",
        mapProfileToUser: (profile) => ({ image: profile.picture }),
        overrideUserInfoOnSignIn: true,
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

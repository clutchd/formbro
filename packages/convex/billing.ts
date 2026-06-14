import { StripeSubscriptions } from "@convex-dev/stripe";
import { fail, type MutationResult, ok, type QueryResult } from "@formbro/core/result";
import { hasString } from "@formbro/core/util";
import { v } from "convex/values";
import Stripe from "stripe";
import type { Doc, Id } from "./_generated/dataModel";
import { api, components, internal } from "./_generated/api";
import { action, internalAction, internalMutation } from "./_generated/server";
import { getUser } from "./auth";
import { defineErrors } from "./errors";
import { ERRORS as WORKSPACE_ERRORS } from "./workspace";

export const ERRORS = defineErrors({
  BILLING_OWNER_ONLY: {
    message: "Only workspace owners can manage billing.",
    status: "FORBIDDEN",
  },
  CUSTOMER_NOT_FOUND: {
    message: "No customer found for this workspace.",
    status: "NOT_FOUND",
  },
  CUSTOMER_PORTAL_SESSION_NOT_CREATED: {
    message: "Customer portal session could not be created. Please try again.",
    status: "INTERNAL_SERVER_ERROR",
  },
  SUBSCRIPTION_SYNC_FAILED: {
    message: "Failed to sync workspace subscription. Please try again.",
    status: "INTERNAL_SERVER_ERROR",
  },
});

function resolvePlanFromPriceId(priceId?: string) {
  if (!hasString(priceId)) return null;

  const basicMonthlyPriceId = process.env.STRIPE_BASIC_MONTHLY_PRICE_ID;
  const basicYearlyPriceId = process.env.STRIPE_BASIC_YEARLY_PRICE_ID;
  const proMonthlyPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const proYearlyPriceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID;

  if (hasString(basicMonthlyPriceId) && priceId === basicMonthlyPriceId) return "basic";
  if (hasString(basicYearlyPriceId) && priceId === basicYearlyPriceId) return "basic";
  if (hasString(proMonthlyPriceId) && priceId === proMonthlyPriceId) return "pro";
  if (hasString(proYearlyPriceId) && priceId === proYearlyPriceId) return "pro";

  return null;
}

const client = new StripeSubscriptions(components.stripe, {});
const stripe = new Stripe(client.apiKey);

export const createWorkspaceCustomer = internalAction({
  args: {
    workspace: v.object({
      _id: v.id("workspaces"),
      name: v.string(),
      slug: v.string(),
    }),
  },
  handler: async (
    ctx,
    args,
  ): Promise<
    MutationResult<{ workspaceId: Id<"workspaces">; stripeCustomerId: string } | undefined>
  > => {
    const identity = await getUser(ctx);
    if (!identity.ok) return fail({ data: undefined, error: identity.error });

    const email = hasString(identity.data?.email) ? identity.data.email : undefined;

    const customer = await client.createCustomer(ctx, {
      email,
      name: args.workspace.name,
      metadata: {
        workspaceId: args.workspace._id,
        userId: identity.data.subject,
        workspaceSlug: args.workspace.slug,
      },
      idempotencyKey: args.workspace._id,
    });

    return await ctx.runMutation(internal.workspace.linkStripeCustomer, {
      workspaceId: args.workspace._id,
      stripeCustomerId: customer.customerId,
    });
  },
});

export const syncWorkspaceSubscription = internalMutation({
  args: {
    workspaceId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedWorkspaceId = args.workspaceId
      ? ctx.db.normalizeId("workspaces", args.workspaceId)
      : undefined;

    let workspace = normalizedWorkspaceId ? await ctx.db.get(normalizedWorkspaceId) : undefined;

    if (!workspace) {
      workspace = await ctx.db
        .query("workspaces")
        .withIndex("by_stripe_subscription_id", (q) =>
          q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
        )
        .unique();
    }

    if (!workspace && args.stripeCustomerId) {
      workspace = await ctx.db
        .query("workspaces")
        .withIndex("by_stripe_customer_id", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
        .unique();
    }

    const subscription = {
      plan: resolvePlanFromPriceId(args.stripePriceId) ?? workspace?.plan,
      stripeCustomerId: args.stripeCustomerId ?? workspace?.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId ?? workspace?.stripePriceId,
      billingStatus: args.status,
    };

    if (!workspace) {
      return fail({ data: subscription, error: ERRORS.SUBSCRIPTION_SYNC_FAILED });
    }

    await ctx.db.patch(workspace._id, {
      plan: subscription.plan,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      stripePriceId: subscription.stripePriceId,
      billingStatus: subscription.billingStatus,
    });

    return ok({ data: subscription });
  },
});

export const createCustomerPortalSession = action({
  args: {
    workspaceId: v.id("workspaces"),
    returnUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = (await ctx.runQuery(api.workspace.get, {
      workspaceId: args.workspaceId,
    })) as QueryResult<(Doc<"workspaces"> & { role: "owner" | "admin" | "member" }) | null>;

    if (!workspace.ok) {
      return fail({ data: undefined, error: workspace.error });
    }

    if (!workspace.data) {
      return fail({ data: undefined, error: WORKSPACE_ERRORS.WORKSPACE_NOT_FOUND });
    }

    if (workspace.data.role !== "owner") {
      return fail({ data: undefined, error: ERRORS.BILLING_OWNER_ONLY });
    }

    const existingSubscription = await ctx.runQuery(
      components.stripe.public.getSubscriptionByOrgId,
      { orgId: args.workspaceId },
    );

    let stripeCustomerId: string | undefined =
      workspace.data.stripeCustomerId ?? existingSubscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      const result = await ctx.runAction(internal.billing.createWorkspaceCustomer, {
        workspace: {
          _id: args.workspaceId,
          name: workspace.data.name,
          slug: workspace.data.slug,
        },
      });

      if (!result.ok || !result.data?.stripeCustomerId) {
        return fail({ data: undefined, error: ERRORS.CUSTOMER_NOT_FOUND });
      }

      stripeCustomerId = result.data.stripeCustomerId;
    }

    const session = await client.createCustomerPortalSession(ctx, {
      customerId: stripeCustomerId,
      returnUrl: args.returnUrl,
    });

    if (!session.url) {
      return fail({ data: undefined, error: ERRORS.CUSTOMER_PORTAL_SESSION_NOT_CREATED });
    }

    return ok({ url: session.url });
  },
});

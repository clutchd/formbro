import { StripeSubscriptions } from "@convex-dev/stripe";
import { fail, type MutationResult, ok, type QueryResult } from "@formbro/shared/result";
import { hasString } from "@formbro/shared/util";
import { v } from "convex/values";
import Stripe from "stripe";
import type { Doc, Id } from "./_generated/dataModel";
import { api, components, internal } from "./_generated/api";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { getUser } from "./auth";
import {
  billingIntervalValidator,
  canDeleteWorkspace,
  getSubmissionLimitReason,
  getStripePriceIdForPlan,
  getWorkspaceLimits,
  getWorkspaceMonthlySubmissionPeriod,
  getWorkspaceMonthlySubmissionsUsed,
  getWorkspacePlanLabel,
  getWorkspaceStorageUsedBytes,
  hasActiveWorkspaceSubscriptionStatus,
  normalizeWorkspacePlan,
  resolvePlanFromStripePriceId,
  WORKSPACE_TRIAL_DAYS,
  workspacePlanValidator,
} from "./billingUtils";
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
  ACTIVE_SUBSCRIPTION_EXISTS: {
    message:
      "This workspace already has an active subscription. Use the billing portal to manage it.",
    status: "CONFLICT",
  },
  ACTIVE_SUBSCRIPTION_REQUIRED: {
    message: "This workspace requires an active subscription to perform this action.",
    status: "FORBIDDEN",
  },
  CHECKOUT_SESSION_NOT_CREATED: {
    message: "Checkout session could not be created. Please try again.",
    status: "INTERNAL_SERVER_ERROR",
  },
  STRIPE_PRICE_NOT_CONFIGURED: {
    message: "This plan is not available for checkout yet. Please contact support.",
    status: "INTERNAL_SERVER_ERROR",
  },
  SUBSCRIPTION_SYNC_FAILED: {
    message: "Failed to sync workspace subscription. Please try again.",
    status: "INTERNAL_SERVER_ERROR",
  },
  WORKSPACE_IDENTIFIER_REQUIRED: {
    message: "A workspace id or slug is required.",
    status: "BAD_REQUEST",
  },
});

const client = new StripeSubscriptions(components.stripe, {});
const stripe = new Stripe(client.apiKey);

async function getSubsctionByWorkspaceId(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
) {
  return await ctx.runQuery(components.stripe.public.getSubscriptionByOrgId, {
    orgId: workspaceId,
  });
}

export async function getWorkspaceSubscriptionState(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
) {
  const workspace = await ctx.db.get(workspaceId);
  if (!workspace) {
    return fail({ data: null, error: WORKSPACE_ERRORS.WORKSPACE_NOT_FOUND });
  }

  const subscription = await getSubsctionByWorkspaceId(ctx, workspaceId);

  const workspacePlan = normalizeWorkspacePlan(workspace.plan);
  const subscriptionPriceDetails =
    workspacePlan === "unlimited" ? null : resolvePlanFromStripePriceId(subscription?.priceId);
  const plan =
    workspacePlan === "unlimited"
      ? workspacePlan
      : (subscriptionPriceDetails?.plan ?? workspacePlan);
  const hasActiveSubscription =
    hasActiveWorkspaceSubscriptionStatus(subscription?.status) ||
    hasActiveWorkspaceSubscriptionStatus(workspace.billingStatus) ||
    plan === "unlimited";
  const canDelete = canDeleteWorkspace({
    subscriptionStatus: subscription?.status,
    subscriptionCancelAtPeriodEnd: subscription?.cancelAtPeriodEnd,
    workspaceBillingStatus: workspace.billingStatus,
    plan,
  });
  const limits = getWorkspaceLimits({ hasActiveSubscription, plan });

  return ok({
    workspace,
    subscription,
    plan,
    planLabel: getWorkspacePlanLabel(plan),
    hasActiveSubscription,
    canDelete,
    limits,
  });
}

export async function getWorkspaceSubmissionAllowance(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  incomingBytes: number,
) {
  const subscriptionState = await getWorkspaceSubscriptionState(ctx, workspaceId);
  if (!subscriptionState.ok) {
    return fail({ data: null, error: subscriptionState.error });
  }

  const { hasActiveSubscription, limits, subscription, workspace } = subscriptionState.data;
  if (!hasActiveSubscription) {
    return ok({ allowed: false as const, reason: "inactive_subscription" as const });
  }

  const period = getWorkspaceMonthlySubmissionPeriod(subscription);
  const trackStorage =
    limits.storageBytes !== null || workspace.submissionStorageBytes !== undefined;
  const [monthlySubmissionsUsed, storageUsedBytes] = await Promise.all([
    limits.monthlySubmissions === null
      ? Promise.resolve(0)
      : getWorkspaceMonthlySubmissionsUsed(ctx, workspaceId, period, limits.monthlySubmissions),
    !trackStorage
      ? Promise.resolve(0)
      : workspace.submissionStorageBytes === undefined
        ? getWorkspaceStorageUsedBytes(ctx, workspaceId)
        : Promise.resolve(workspace.submissionStorageBytes),
  ]);
  const reason = getSubmissionLimitReason({
    hasActiveSubscription,
    incomingBytes,
    limits,
    monthlySubmissionsUsed,
    storageUsedBytes,
  });

  if (reason) {
    return ok({ allowed: false as const, reason });
  }

  return ok({
    allowed: true as const,
    nextStorageBytes: trackStorage ? storageUsedBytes + incomingBytes : undefined,
    workspace,
  });
}

export const grantUnlimitedWorkspace = internalMutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    workspaceSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.workspaceId && !hasString(args.workspaceSlug)) {
      return fail({ data: null, error: ERRORS.WORKSPACE_IDENTIFIER_REQUIRED });
    }

    const workspace = args.workspaceId
      ? await ctx.db.get(args.workspaceId)
      : await ctx.db
          .query("workspaces")
          .withIndex("by_slug", (q) => q.eq("slug", args.workspaceSlug ?? ""))
          .unique();

    if (!workspace) {
      return fail({ data: null, error: WORKSPACE_ERRORS.WORKSPACE_NOT_FOUND });
    }

    await ctx.db.patch(workspace._id, {
      plan: "unlimited",
      billingStatus: "active",
    });

    return ok({
      workspaceId: workspace._id,
      workspaceSlug: workspace.slug,
      plan: "unlimited" as const,
      billingStatus: "active" as const,
      hadStripeBilling:
        hasString(workspace.stripeCustomerId) ||
        hasString(workspace.stripeSubscriptionId) ||
        hasString(workspace.stripePriceId),
    });
  },
});

export async function requireWorkspaceSubscription(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
) {
  const subscriptionState = await getWorkspaceSubscriptionState(ctx, workspaceId);
  if (!subscriptionState.ok) return fail({ data: null, error: subscriptionState.error });

  if (!subscriptionState.data.hasActiveSubscription) {
    return fail({ data: null, error: ERRORS.ACTIVE_SUBSCRIPTION_REQUIRED });
  }

  return ok(subscriptionState.data);
}

export const hasActiveWorkspaceSubscription = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const subscriptionState = await getWorkspaceSubscriptionState(ctx, args.workspaceId);
    return subscriptionState.ok && subscriptionState.data.hasActiveSubscription;
  },
});

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
        orgId: args.workspace._id,
        userId: identity.data.subject,
        slug: args.workspace.slug,
      },
      idempotencyKey: args.workspace._id,
    });

    return await ctx.runMutation(internal.workspace.linkStripeCustomer, {
      workspaceId: args.workspace._id,
      stripeCustomerId: customer.customerId,
    });
  },
});

export const syncSubscription = internalMutation({
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

    const priceDetails = resolvePlanFromStripePriceId(args.stripePriceId);
    const subscription = {
      plan: priceDetails?.plan ?? workspace?.plan,
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

    return ok({
      ownerAuthId: workspace.ownerAuthId,
      subscription,
      workspaceId: workspace._id,
      workspaceSlug: workspace.slug,
    });
  },
});

export const createPortalSession = action({
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

export const createSubscriptionCheckout = action({
  args: {
    workspaceId: v.id("workspaces"),
    plan: workspacePlanValidator,
    interval: billingIntervalValidator,
    successUrl: v.string(),
    cancelUrl: v.string(),
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

    if (existingSubscription && hasActiveWorkspaceSubscriptionStatus(existingSubscription.status)) {
      return fail({ data: undefined, error: ERRORS.ACTIVE_SUBSCRIPTION_EXISTS });
    }

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

    const stripePriceId = getStripePriceIdForPlan(args.plan, args.interval);
    if (!stripePriceId) {
      return fail({ data: undefined, error: ERRORS.STRIPE_PRICE_NOT_CONFIGURED });
    }

    const shouldStartTrial = !existingSubscription && !workspace.data.stripeSubscriptionId;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      metadata: {
        orgId: workspace.data._id,
        plan: args.plan,
        interval: args.interval,
        slug: workspace.data.slug,
      },
      subscription_data: {
        metadata: {
          orgId: workspace.data._id,
          plan: args.plan,
          interval: args.interval,
          slug: workspace.data.slug,
        },
        ...(shouldStartTrial ? { trial_period_days: WORKSPACE_TRIAL_DAYS } : {}),
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      return fail({ data: undefined, error: ERRORS.CHECKOUT_SESSION_NOT_CREATED });
    }

    return ok({ sessionId: session.id, url: session.url });
  },
});

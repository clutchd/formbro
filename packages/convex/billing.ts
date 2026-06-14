import { StripeSubscriptions } from "@convex-dev/stripe";
import { fail, ok, type QueryResult } from "@formbro/core/result";
import { v } from "convex/values";
import Stripe from "stripe";
import type { Doc } from "./_generated/dataModel";
import { api, components } from "./_generated/api";
import { action, internalMutation } from "./_generated/server";
import { defineErrors } from "./errors";
import { ERRORS as WORKSPACE_ERRORS } from "./workspace";

export const ERRORS = defineErrors({
  BILLING_OWNER_ONLY: {
    message: "Only workspace owners can manage billing.",
    status: "FORBIDDEN",
  },
  STRIPE_CUSTOMER_NOT_FOUND: {
    message: "No Stripe customer found for this workspace yet.",
    status: "NOT_FOUND",
  },
});

const client = new StripeSubscriptions(components.stripe, {});
const stripe = new Stripe(client.apiKey);

export const syncWorkspaceSubscription = internalMutation({
  args: {
    workspaceId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(args);
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

    const stripeCustomerId: string | undefined =
      workspace.data.stripeCustomerId ?? existingSubscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      return fail({ data: undefined, error: ERRORS.STRIPE_CUSTOMER_NOT_FOUND });
    }

    const session = await client.createCustomerPortalSession(ctx, {
      customerId: stripeCustomerId,
      returnUrl: args.returnUrl,
    });

    return ok({ url: session.url });
  },
});

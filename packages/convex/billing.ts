import { StripeSubscriptions } from "@convex-dev/stripe";
import { v } from "convex/values";
import Stripe from "stripe";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";

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

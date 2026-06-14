import type { GenericActionCtx, GenericDataModel } from "convex/server";
import { registerRoutes } from "@convex-dev/stripe";
import { ok } from "@formbro/core/result";
import { hasString } from "@formbro/core/util";
import { httpRouter } from "convex/server";
import Stripe from "stripe";
import { components, internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { resendClient } from "./emails";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, { cors: true });

function getSubscriptionMetadata(subscription: Stripe.Subscription) {
  const workspaceId = subscription.metadata?.workspaceId;
  return {
    workspaceId: hasString(workspaceId) ? workspaceId : undefined,
    stripeCustomerId: hasString(subscription.customer)
      ? subscription.customer
      : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0]?.price?.id,
    status: subscription.status,
  };
}

registerRoutes(http, components.stripe, {
  webhookPath: "/webhooks/stripe",
  events: {
    "customer.subscription.created": async (
      ctx: GenericActionCtx<GenericDataModel>,
      event: Stripe.Event,
    ) => {
      await ctx.runMutation(
        internal.billing.syncWorkspaceSubscription,
        getSubscriptionMetadata(event.data.object as Stripe.Subscription),
      );
    },
    "customer.subscription.updated": async (
      ctx: GenericActionCtx<GenericDataModel>,
      event: Stripe.Event,
    ) => {
      await ctx.runMutation(
        internal.billing.syncWorkspaceSubscription,
        getSubscriptionMetadata(event.data.object as Stripe.Subscription),
      );
    },
    "customer.subscription.deleted": async (
      ctx: GenericActionCtx<GenericDataModel>,
      event: Stripe.Event,
    ) => {
      await ctx.runMutation(
        internal.billing.syncWorkspaceSubscription,
        getSubscriptionMetadata(event.data.object as Stripe.Subscription),
      );
    },
  },
});

http.route({
  path: "/webhooks/resend",
  method: "POST",
  handler: httpAction((ctx, request) => resendClient.handleResendEventWebhook(ctx, request)),
});

http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify(ok()), { status: 200 });
  }),
});

export default http;

import type { GenericActionCtx, GenericDataModel } from "convex/server";
import { registerRoutes } from "@convex-dev/stripe";
import { ok } from "@formbro/shared/result";
import { hasString } from "@formbro/shared/util";
import { httpRouter } from "convex/server";
import Stripe from "stripe";
import { components, internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { chat, options } from "./ai";
import { authComponent, createAuth } from "./auth";
import {
  getSubscriptionLifecycleEvents,
  type SubscriptionLifecycleEventType,
} from "./billingAnalytics";
import { resendClient } from "./emails";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, { cors: true });

function getSubscriptionMetadata(subscription: Stripe.Subscription) {
  const workspaceId = subscription.metadata?.orgId;
  const subscriptionItem = subscription.items.data[0];

  return {
    workspaceId: hasString(workspaceId) ? workspaceId : undefined,
    stripeCustomerId: hasString(subscription.customer)
      ? subscription.customer
      : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscriptionItem?.price?.id,
    status: subscription.status,
  };
}

async function syncSubscriptionAndCapture(
  ctx: GenericActionCtx<GenericDataModel>,
  event: Stripe.Event,
  eventType: SubscriptionLifecycleEventType,
) {
  const subscription = event.data.object as Stripe.Subscription;
  const result = await ctx.runMutation(
    internal.billing.syncSubscription,
    getSubscriptionMetadata(subscription),
  );

  if (!result.ok) return;

  const previousAttributes = event.data.previous_attributes as
    | Partial<Stripe.Subscription>
    | undefined;
  const previousStatus = previousAttributes?.status;
  const analyticsEvents = getSubscriptionLifecycleEvents({
    eventId: event.id,
    eventType,
    previousStatus,
    status: subscription.status,
  });

  await Promise.all(
    analyticsEvents.map(({ deduplicationKey, event: analyticsEvent }) =>
      ctx.scheduler.runAfter(0, internal.analytics.capture, {
        deduplicationKey,
        distinctId: result.data.ownerAuthId,
        event: analyticsEvent,
        properties: {
          billing_interval: subscription.metadata.interval,
          plan: subscription.metadata.plan,
          ...(previousStatus ? { previous_status: previousStatus } : {}),
          status: subscription.status,
          stripe_event_id: event.id,
          stripe_subscription_id: subscription.id,
          workspace_id: result.data.workspaceId,
          workspace_slug: result.data.workspaceSlug,
        },
        timestamp: new Date(event.created * 1_000).toISOString(),
        workspaceId: result.data.workspaceId,
      }),
    ),
  );
}

registerRoutes(http, components.stripe, {
  webhookPath: "/webhooks/stripe",
  events: {
    "customer.subscription.created": async (
      ctx: GenericActionCtx<GenericDataModel>,
      event: Stripe.Event,
    ) => {
      await syncSubscriptionAndCapture(ctx, event, "customer.subscription.created");
    },
    "customer.subscription.updated": async (
      ctx: GenericActionCtx<GenericDataModel>,
      event: Stripe.Event,
    ) => {
      await syncSubscriptionAndCapture(ctx, event, "customer.subscription.updated");
    },
    "customer.subscription.deleted": async (
      ctx: GenericActionCtx<GenericDataModel>,
      event: Stripe.Event,
    ) => {
      await syncSubscriptionAndCapture(ctx, event, "customer.subscription.deleted");
    },
  },
});

http.route({
  path: "/webhooks/resend",
  method: "POST",
  handler: httpAction((ctx, request) => resendClient.handleResendEventWebhook(ctx, request)),
});

http.route({
  path: "/ai/chat",
  method: "OPTIONS",
  handler: options,
});

http.route({
  path: "/ai/chat",
  method: "POST",
  handler: chat,
});

http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify(ok()), { status: 200 });
  }),
});

export default http;

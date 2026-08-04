import type { GenericActionCtx, GenericDataModel } from "convex/server";
import { registerRoutes } from "@convex-dev/stripe";
import { EmbedTelemetryPayloadSchema } from "@formbro/core/embed";
import { ok } from "@formbro/shared/result";
import { hasString } from "@formbro/shared/util";
import { httpRouter } from "convex/server";
import Stripe from "stripe";
import { components, internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { chat, options } from "./ai";
import { authComponent, createAuth } from "./auth";
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

registerRoutes(http, components.stripe, {
  webhookPath: "/webhooks/stripe",
  events: {
    "customer.subscription.created": async (
      ctx: GenericActionCtx<GenericDataModel>,
      event: Stripe.Event,
    ) => {
      await ctx.runMutation(
        internal.billing.syncSubscription,
        getSubscriptionMetadata(event.data.object as Stripe.Subscription),
      );
    },
    "customer.subscription.updated": async (
      ctx: GenericActionCtx<GenericDataModel>,
      event: Stripe.Event,
    ) => {
      await ctx.runMutation(
        internal.billing.syncSubscription,
        getSubscriptionMetadata(event.data.object as Stripe.Subscription),
      );
    },
    "customer.subscription.deleted": async (
      ctx: GenericActionCtx<GenericDataModel>,
      event: Stripe.Event,
    ) => {
      await ctx.runMutation(
        internal.billing.syncSubscription,
        getSubscriptionMetadata(event.data.object as Stripe.Subscription),
      );
    },
  },
});

http.route({
  path: "/embed/telemetry",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 2_048) {
      return new Response(null, { status: 413 });
    }

    const text = await request.text();
    if (text.length > 2_048) {
      return new Response(null, { status: 413 });
    }

    let input: unknown;
    try {
      input = JSON.parse(text);
    } catch {
      return new Response(null, { status: 400 });
    }

    const payload = EmbedTelemetryPayloadSchema.safeParse(input);
    if (!payload.success) {
      return new Response(null, { status: 400 });
    }

    const recorded = await ctx.runMutation(internal.embedTelemetry.record, {
      duration: payload.data.duration,
      hadError: payload.data.hadError,
      publicId: payload.data.publicId,
      revision: payload.data.revision,
      started: payload.data.started,
      submitted: payload.data.submitted,
    });

    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
      status: recorded ? 202 : 404,
    });
  }),
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

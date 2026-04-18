import { registerRoutes } from "@convex-dev/stripe";
import { httpRouter } from "convex/server";
import { components } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { resendClient } from "./resend/emails";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, { cors: true });

registerRoutes(http, components.stripe, {
  webhookPath: "/webhooks/stripe",
});

http.route({
  path: "/webhooks/resend",
  method: "POST",
  handler: httpAction((ctx, request) => resendClient.handleResendEventWebhook(ctx, request)),
});

export default http;

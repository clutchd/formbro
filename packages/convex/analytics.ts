"use node";

import { ANALYTICS_EVENTS, createAnalytics, type Analytics } from "@formbro/core/analytics";
import { v } from "convex/values";
import { PostHog } from "posthog-node";
import { internalAction } from "./_generated/server";

const POSTHOG_HOST = "https://us.i.posthog.com";

let analytics: Analytics<Promise<void>> | null | undefined;

function getAnalytics() {
  if (analytics !== undefined) return analytics;

  const token = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!token) {
    analytics = null;
    return analytics;
  }

  const posthog = new PostHog(token, {
    flushAt: 1,
    flushInterval: 0,
    host: POSTHOG_HOST,
  });

  analytics = createAnalytics(({ context, name, properties }) => {
    const actor = context?.actor;

    return posthog.captureImmediate({
      distinctId: actor?.id,
      event: name,
      properties: {
        ...properties,
        ...(actor?.properties ? { $set: actor.properties } : {}),
        ...(actor?.initialProperties ? { $set_once: actor.initialProperties } : {}),
      },
      timestamp: context?.occurredAt,
    });
  });

  return analytics;
}

export const captureSignup = internalAction({
  args: {
    createdAt: v.number(),
    email: v.string(),
    name: v.string(),
    userId: v.string(),
  },
  handler: async (_ctx, { createdAt, email, name, userId }) => {
    const analytics = getAnalytics();
    if (!analytics) return;
    const occurredAt = new Date(createdAt);

    await analytics.capture(
      ANALYTICS_EVENTS.USER_SIGNED_UP,
      {
        signup_source: "auth_user_created",
        user_id: userId,
      },
      {
        actor: {
          id: userId,
          initialProperties: {
            signed_up_at: occurredAt.toISOString(),
          },
          properties: {
            email,
            name,
            user_id: userId,
          },
        },
        occurredAt,
      },
    );
  },
});

import { v } from "convex/values";
import { internalAction } from "./_generated/server";

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

export const capture = internalAction({
  args: {
    distinctId: v.string(),
    event: v.string(),
    properties: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (_ctx, { distinctId, event, properties }) => {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!apiKey) return;

    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST;

    try {
      const response = await fetch(`${host.replace(/\/$/, "")}/capture/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          event,
          properties: {
            distinct_id: distinctId,
            ...properties,
          },
        }),
      });

      if (!response.ok) {
        console.error("PostHog capture failed", { event, status: response.status });
      }
    } catch (error) {
      console.error("PostHog capture failed", { error, event });
    }
  },
});

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { buildPostHogCapturePayload } from "./analyticsPayload";

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";
const MAX_CAPTURE_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1_000;

export const capture = internalAction({
  args: {
    attempt: v.optional(v.number()),
    deduplicationKey: v.optional(v.string()),
    distinctId: v.string(),
    event: v.string(),
    properties: v.optional(v.record(v.string(), v.any())),
    timestamp: v.optional(v.string()),
    workspaceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!apiKey) return;

    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? DEFAULT_POSTHOG_HOST;

    try {
      const payload = await buildPostHogCapturePayload({
        apiKey,
        deduplicationKey: args.deduplicationKey,
        distinctId: args.distinctId,
        event: args.event,
        properties: args.properties,
        timestamp: args.timestamp,
        workspaceId: args.workspaceId,
      });
      const response = await fetch(`${host.replace(/\/$/, "")}/capture/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`PostHog capture failed with status ${response.status}`);
      }
    } catch (error) {
      const attempt = args.attempt ?? 1;
      if (attempt < MAX_CAPTURE_ATTEMPTS) {
        await ctx.scheduler.runAfter(
          RETRY_DELAY_MS * 2 ** (attempt - 1),
          internal.analytics.capture,
          {
            attempt: attempt + 1,
            ...(args.deduplicationKey ? { deduplicationKey: args.deduplicationKey } : {}),
            distinctId: args.distinctId,
            event: args.event,
            ...(args.properties ? { properties: args.properties } : {}),
            ...(args.timestamp ? { timestamp: args.timestamp } : {}),
            ...(args.workspaceId ? { workspaceId: args.workspaceId } : {}),
          },
        );
        return;
      }

      console.error("PostHog capture failed after retries", { error, event: args.event });
      throw error;
    }
  },
});

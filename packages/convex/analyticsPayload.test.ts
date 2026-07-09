import { describe, expect, it } from "bun:test";
import { buildPostHogCapturePayload } from "./analyticsPayload";

describe("buildPostHogCapturePayload", () => {
  it("creates a stable, grouped PostHog event envelope", async () => {
    const input = {
      apiKey: "phc_test",
      deduplicationKey: "evt_trial:trial_started",
      distinctId: "user_123",
      event: "trial_started",
      properties: { plan: "pro" },
      timestamp: "2026-07-09T19:35:00.000Z",
      workspaceId: "workspace_123",
    };

    const first = await buildPostHogCapturePayload(input);
    const second = await buildPostHogCapturePayload(input);

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      api_key: "phc_test",
      event: "trial_started",
      properties: {
        $groups: { workspace: "workspace_123" },
        distinct_id: "user_123",
        plan: "pro",
      },
      timestamp: "2026-07-09T19:35:00.000Z",
    });
    expect(first.uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});

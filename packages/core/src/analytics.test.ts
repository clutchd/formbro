import { describe, expect, test } from "bun:test";
import { ANALYTICS_EVENTS, createAnalytics, type AnyAnalyticsEvent } from "./analytics";

describe("analytics", () => {
  test("sends typed events through the configured sink", () => {
    const sent: AnyAnalyticsEvent[] = [];
    const analytics = createAnalytics((event) => {
      sent.push(event);
    });

    analytics.capture(ANALYTICS_EVENTS.PUBLIC_FORM_SUBMITTED, {
      form_id: "form-id",
      form_status: "ready",
      workspace_slug: "workspace",
    });

    expect(sent).toEqual([
      {
        name: "public_form_submitted",
        properties: {
          form_id: "form-id",
          form_status: "ready",
          workspace_slug: "workspace",
        },
      },
    ]);
  });

  test("preserves actor identity, person properties, and event time", () => {
    const sent: AnyAnalyticsEvent[] = [];
    const analytics = createAnalytics((event) => {
      sent.push(event);
    });
    const timestamp = new Date("2026-08-09T12:00:00.000Z");

    analytics.capture(
      ANALYTICS_EVENTS.USER_SIGNED_UP,
      {
        signup_source: "auth_user_created",
        user_id: "user-id",
      },
      {
        actor: {
          id: "user-id",
          initialProperties: {
            signed_up_at: timestamp.toISOString(),
          },
          properties: {
            email: "person@example.com",
            name: "Person",
          },
        },
        occurredAt: timestamp,
      },
    );

    expect(sent).toEqual([
      {
        context: {
          actor: {
            id: "user-id",
            initialProperties: {
              signed_up_at: "2026-08-09T12:00:00.000Z",
            },
            properties: {
              email: "person@example.com",
              name: "Person",
            },
          },
          occurredAt: timestamp,
        },
        name: "user_signed_up",
        properties: {
          signup_source: "auth_user_created",
          user_id: "user-id",
        },
      },
    ]);
  });
});

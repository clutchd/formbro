import { describe, expect, it } from "bun:test";
import { getSubscriptionLifecycleEvents } from "./billingAnalytics";

describe("getSubscriptionLifecycleEvents", () => {
  it("records both subscription and trial starts", () => {
    expect(
      getSubscriptionLifecycleEvents({
        eventId: "evt_trial",
        eventType: "customer.subscription.created",
        status: "trialing",
      }),
    ).toEqual([
      {
        event: "subscription_started",
        insertId: "evt_trial:subscription_started",
      },
      {
        event: "trial_started",
        insertId: "evt_trial:trial_started",
      },
    ]);
  });

  it("records a trial conversion when Stripe activates a trialing subscription", () => {
    expect(
      getSubscriptionLifecycleEvents({
        eventId: "evt_conversion",
        eventType: "customer.subscription.updated",
        previousStatus: "trialing",
        status: "active",
      }),
    ).toEqual([
      {
        event: "subscription_status_changed",
        insertId: "evt_conversion:subscription_status_changed",
      },
      {
        event: "trial_converted",
        insertId: "evt_conversion:trial_converted",
      },
    ]);
  });

  it("records cancellations without reporting a conversion", () => {
    expect(
      getSubscriptionLifecycleEvents({
        eventId: "evt_cancelled",
        eventType: "customer.subscription.deleted",
        previousStatus: "active",
        status: "canceled",
      }),
    ).toEqual([
      {
        event: "subscription_cancelled",
        insertId: "evt_cancelled:subscription_cancelled",
      },
    ]);
  });
});

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
        deduplicationKey: "evt_trial:subscription_started",
        event: "subscription_started",
      },
      {
        deduplicationKey: "evt_trial:trial_started",
        event: "trial_started",
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
        deduplicationKey: "evt_conversion:subscription_status_changed",
        event: "subscription_status_changed",
      },
      {
        deduplicationKey: "evt_conversion:trial_converted",
        event: "trial_converted",
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
        deduplicationKey: "evt_cancelled:subscription_cancelled",
        event: "subscription_cancelled",
      },
    ]);
  });

  it("ignores subscription updates that do not change status", () => {
    expect(
      getSubscriptionLifecycleEvents({
        eventId: "evt_metadata",
        eventType: "customer.subscription.updated",
        status: "active",
      }),
    ).toEqual([]);
  });
});

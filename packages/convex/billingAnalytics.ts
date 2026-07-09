export type SubscriptionLifecycleEventType =
  | "customer.subscription.created"
  | "customer.subscription.deleted"
  | "customer.subscription.updated";

type SubscriptionLifecycleInput = {
  eventId: string;
  eventType: SubscriptionLifecycleEventType;
  previousStatus?: string;
  status: string;
};

type SubscriptionLifecycleEvent = {
  deduplicationKey: string;
  event: string;
};

export function getSubscriptionLifecycleEvents({
  eventId,
  eventType,
  previousStatus,
  status,
}: SubscriptionLifecycleInput): SubscriptionLifecycleEvent[] {
  const events: SubscriptionLifecycleEvent[] = [];

  if (eventType === "customer.subscription.created") {
    events.push({
      deduplicationKey: `${eventId}:subscription_started`,
      event: "subscription_started",
    });

    if (status === "trialing") {
      events.push({
        deduplicationKey: `${eventId}:trial_started`,
        event: "trial_started",
      });
    }
  }

  if (
    eventType === "customer.subscription.updated" &&
    previousStatus &&
    previousStatus !== status
  ) {
    events.push({
      deduplicationKey: `${eventId}:subscription_status_changed`,
      event: "subscription_status_changed",
    });

    if (previousStatus === "trialing" && status === "active") {
      events.push({
        deduplicationKey: `${eventId}:trial_converted`,
        event: "trial_converted",
      });
    }
  }

  if (eventType === "customer.subscription.deleted") {
    events.push({
      deduplicationKey: `${eventId}:subscription_cancelled`,
      event: "subscription_cancelled",
    });
  }

  return events;
}

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
  event: string;
  insertId: string;
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
      event: "subscription_started",
      insertId: `${eventId}:subscription_started`,
    });

    if (status === "trialing") {
      events.push({
        event: "trial_started",
        insertId: `${eventId}:trial_started`,
      });
    }
  }

  if (eventType === "customer.subscription.updated") {
    events.push({
      event: "subscription_status_changed",
      insertId: `${eventId}:subscription_status_changed`,
    });

    if (previousStatus === "trialing" && status === "active") {
      events.push({
        event: "trial_converted",
        insertId: `${eventId}:trial_converted`,
      });
    }
  }

  if (eventType === "customer.subscription.deleted") {
    events.push({
      event: "subscription_cancelled",
      insertId: `${eventId}:subscription_cancelled`,
    });
  }

  return events;
}

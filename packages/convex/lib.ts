export function hasString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export const PLANS = ["basic", "pro"] as const;
export type Plan = (typeof PLANS)[number];
export type WorkspacePlan = Plan | "unlimited";

export const WORKSPACE_PLAN_LABELS: Record<WorkspacePlan, string> = {
  basic: "Basic",
  pro: "Pro",
  unlimited: "Unlimited",
};

export function getWorkspacePlanLabel(plan?: WorkspacePlan) {
  return plan ? WORKSPACE_PLAN_LABELS[plan] : "Unpaid";
}

export const PLAN_MONTHLY_PRICE_USD: Record<Plan, number> = {
  basic: 10,
  pro: 25,
};

export const PLAN_YEARLY_PRICE_USD_MULTIPLIER = 10;

export const BILLING_STATUSES = [
  "not_subscribed",
  "incomplete",
  "incomplete_expired",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "paused",
] as const;

export function getWorkspaceBillingState(billingStatus?: string) {
  switch (billingStatus) {
    case "active":
    case "trialing":
      return "success";
    case "not_subscribed":
    case "paused":
      return "warning";
    default:
      return "error";
  }
}

export const GIBIBYTE = 1024 ** 3;

export const PLAN_STORAGE_LIMIT_BYTES: Record<Plan, number> = {
  basic: 100 * GIBIBYTE,
  pro: 1024 * GIBIBYTE,
};

import { hasString } from "@formbro/shared/util";
import { v } from "convex/values";
import { formatStorage, GIGABYTE, numberFormatter } from "./lib";

export const WORKSPACE_TRIAL_DAYS = 14;

export const workspacePlanValidator = v.union(v.literal("basic"), v.literal("pro"));
export const billingIntervalValidator = v.union(v.literal("monthly"), v.literal("annual"));

const BILLING_STATUSES = [
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
type BillingStatus = (typeof BILLING_STATUSES)[number];

export const PLANS = ["basic", "pro"] as const;
export type Plan = (typeof PLANS)[number];
type WorkspacePlan = "free" | Plan | "unlimited";

const WORKSPACE_PLAN_LABELS: Record<WorkspacePlan, string> = {
  free: "Unpaid",
  basic: "Basic",
  pro: "Pro",
  unlimited: "Unlimited",
};

const WORKSPACE_PLAN_DESCRIPTIONS: Record<Plan, string> = {
  basic: "Everything you need to run your forms.",
  pro: "Higher limits for growing teams and workflows.",
};

const WORKSPACE_PLAN_MONTHLY_PRICE_USD: Record<Plan, number> = {
  basic: 10,
  pro: 25,
};

const WORKSPACE_PLAN_YEARLY_PRICE_USD_MULTIPLIER = 10;

export const WORKSPACE_LIMITS: Record<
  WorkspacePlan,
  {
    members: number | null;
    activeForms: number | null;
    monthlySubmissions: number | null;
    storageBytes: number | null;
  }
> = {
  free: {
    members: 1,
    activeForms: 0,
    monthlySubmissions: 0,
    storageBytes: 0,
  },
  basic: {
    members: null,
    activeForms: 10,
    monthlySubmissions: 1000,
    storageBytes: 100 * GIGABYTE,
  },
  pro: {
    members: null,
    activeForms: 100,
    monthlySubmissions: 10000,
    storageBytes: 1024 * GIGABYTE,
  },
  unlimited: {
    members: null,
    activeForms: null,
    monthlySubmissions: null,
    storageBytes: null,
  },
} as const;

export function normalizeWorkspacePlan(plan?: WorkspacePlan): WorkspacePlan {
  switch (plan) {
    case "free":
    case "unlimited":
    case "basic":
    case "pro":
      return plan;
    default:
      return "free";
  }
}

function formatLimitFeature(value: number | null, singular: string, plural: string, suffix = "") {
  if (value === null) {
    return `Unlimited ${plural}${suffix}`;
  }
  return `${numberFormatter.format(value)} ${value === 1 ? singular : plural}${suffix}`;
}

function formatStorageFeature(bytes: number | null) {
  if (bytes === null) {
    return "Unlimited storage";
  }
  return `${formatStorage(bytes)} storage`;
}

export function getPlanFeatures(plan: Plan): readonly string[] {
  const limits = WORKSPACE_LIMITS[plan];

  return [
    formatLimitFeature(limits.members, "seat", "seats"),
    formatLimitFeature(limits.activeForms, "active form", "active forms"),
    formatLimitFeature(limits.monthlySubmissions, "submission", "submissions", " / month"),
    formatStorageFeature(limits.storageBytes),
    plan === "pro" ? "Priority support" : "Email support",
  ];
}

export function getPlanDetails(plan: Plan) {
  const normalizedPlan = normalizeWorkspacePlan(plan) as Plan;
  const name = WORKSPACE_PLAN_LABELS[normalizedPlan];

  const monthlyPriceId =
    normalizedPlan === "basic"
      ? process.env.STRIPE_BASIC_MONTHLY_PRICE_ID
      : process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const yearlyPriceId =
    normalizedPlan === "basic"
      ? process.env.STRIPE_BASIC_YEARLY_PRICE_ID
      : process.env.STRIPE_PRO_YEARLY_PRICE_ID;

  return {
    name,
    description: WORKSPACE_PLAN_DESCRIPTIONS[normalizedPlan],
    monthlyPriceUsd: WORKSPACE_PLAN_MONTHLY_PRICE_USD[normalizedPlan],
    monthlyPriceId,
    yearlyPriceUsd:
      WORKSPACE_PLAN_MONTHLY_PRICE_USD[normalizedPlan] * WORKSPACE_PLAN_YEARLY_PRICE_USD_MULTIPLIER,
    yearlyPriceId,
    features: getPlanFeatures(normalizedPlan),
  };
}

export function resolvePlanFromStripePriceId(
  stripePriceId: string | undefined | null,
): Plan | null {
  if (!hasString(stripePriceId)) return null;

  const basicPriceId = process.env.STRIPE_BASIC_MONTHLY_PRICE_ID;
  const basicYearlyPriceId = process.env.STRIPE_BASIC_YEARLY_PRICE_ID;
  const proPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const proYearlyPriceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID;

  if (hasString(basicPriceId) && stripePriceId === basicPriceId) return "basic";
  if (hasString(basicYearlyPriceId) && stripePriceId === basicYearlyPriceId) return "basic";
  if (hasString(proPriceId) && stripePriceId === proPriceId) return "pro";
  if (hasString(proYearlyPriceId) && stripePriceId === proYearlyPriceId) return "pro";

  return null;
}

export function getWorkspaceBillingStatusColor(billingStatus?: string) {
  switch (billingStatus) {
    case "active":
    case "trialing":
      return "success";
    case "paused":
      return "warning";
    default:
      return "error";
  }
}

export function getWorkspacePlanLabel(plan?: WorkspacePlan) {
  return WORKSPACE_PLAN_LABELS[normalizeWorkspacePlan(plan)];
}

export function hasActiveWorkspaceSubscriptionStatus(
  status: string | undefined | null | { plan?: WorkspacePlan; billingStatus?: string },
): boolean {
  if (typeof status === "object") {
    return (
      hasActiveWorkspaceSubscriptionStatus(status?.billingStatus) ||
      normalizeWorkspacePlan(status?.plan) === "unlimited"
    );
  }

  return status === "active" || status === "trialing" || status === "past_due";
}

export function canDeleteWorkspace(input: {
  subscriptionStatus?: string | null;
  subscriptionCancelAtPeriodEnd?: boolean;
  workspaceBillingStatus?: string | null;
  workspaceBillingCancelAtPeriodEnd?: boolean;
  plan?: string;
}) {
  if (input.plan === "unlimited") {
    return true;
  }

  // User already cancelled — including trial subs that run until period end.
  if (input.subscriptionCancelAtPeriodEnd || input.workspaceBillingCancelAtPeriodEnd) {
    return true;
  }

  if (input.subscriptionStatus === "canceled") {
    return true;
  }

  if (input.subscriptionStatus != null) {
    return !hasActiveWorkspaceSubscriptionStatus(input.subscriptionStatus);
  }

  if (
    input.workspaceBillingStatus === "canceled" ||
    input.workspaceBillingStatus === "not_subscribed"
  ) {
    return true;
  }

  return !hasActiveWorkspaceSubscriptionStatus(input.workspaceBillingStatus);
}

export function getStripePriceIdForPlan(plan: Plan, interval: "monthly" | "annual") {
  const details = getPlanDetails(plan);
  const priceId = interval === "annual" ? details.yearlyPriceId : details.monthlyPriceId;
  return hasString(priceId) ? priceId : null;
}

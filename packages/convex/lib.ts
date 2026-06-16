import { codes } from "@formbro/core/result";
import { v, type Validator } from "convex/values";

export function Result<T extends Validator<any, any, any>>(schema: T) {
  return v.union(
    v.object({ ok: v.literal(true), data: v.optional(schema) }),
    v.object({
      ok: v.literal(false),
      data: v.optional(v.any()),
      error: v.optional(
        v.object({
          code: v.string(),
          message: v.string(),
          status: v.union(
            ...(Object.keys(codes) as Array<keyof typeof codes>).map((status) => v.literal(status)),
          ),
        }),
      ),
    }),
  );
}

export const PLANS = ["basic", "pro"] as const;
export type Plan = (typeof PLANS)[number];
export type WorkspacePlan = "free" | Plan | "unlimited";

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

export function getWorkspaceBillingState(billingStatus?: string) {
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

const GIBIBYTE = 1024 ** 3;
const MEGABYTE = 1024 ** 2;

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
    storageBytes: 100 * GIBIBYTE,
  },
  pro: {
    members: null,
    activeForms: 100,
    monthlySubmissions: 10000,
    storageBytes: 1024 * GIBIBYTE,
  },
  unlimited: {
    members: null,
    activeForms: null,
    monthlySubmissions: null,
    storageBytes: null,
  },
} as const;

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

export function getWorkspacePlanLabel(plan?: WorkspacePlan) {
  return WORKSPACE_PLAN_LABELS[normalizeWorkspacePlan(plan)];
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

export const numberFormatter = new Intl.NumberFormat("en-US");

export function formatUsd(amount: number) {
  const hasCents = !Number.isInteger(amount);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount);
}

export function formatStorageLimit(bytes: number) {
  if (bytes >= 1024 * GIBIBYTE) {
    return `${Math.round(bytes / (1024 * GIBIBYTE))} TB`;
  }

  return `${Math.round(bytes / GIBIBYTE)} GB`;
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

  return `${formatStorageLimit(bytes)} storage`;
}

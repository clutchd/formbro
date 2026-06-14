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

function normalizeWorkspacePlan(plan?: WorkspacePlan): WorkspacePlan {
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
export const MEGABYTE = 1024 ** 2;

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
    activeForms: null,
    monthlySubmissions: 10000,
    storageBytes: 100 * GIBIBYTE,
  },
  pro: {
    members: null,
    activeForms: null,
    monthlySubmissions: 100000,
    storageBytes: 1024 * GIBIBYTE,
  },
  unlimited: {
    members: null,
    activeForms: null,
    monthlySubmissions: null,
    storageBytes: null,
  },
} as const;

export function isWorkspaceBillingActive(billingStatus?: string) {
  switch (billingStatus) {
    case "active":
    case "trialing":
    case "past_due":
      return true;
    default:
      return false;
  }
}

export function getWorkspacePlanLabel(plan?: WorkspacePlan) {
  return WORKSPACE_PLAN_LABELS[normalizeWorkspacePlan(plan)];
}

export function getWorkspaceLimits(workspace: { plan?: WorkspacePlan; billingStatus?: string }) {
  return WORKSPACE_LIMITS[normalizeWorkspacePlan(workspace.plan)];

import { SYSTEM_WORKSPACE_SLUG } from "@formbro/shared/brand";
import { hasString } from "@formbro/shared/util";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { formatStorage, GIGABYTE, numberFormatter } from "./lib";

export const WORKSPACE_TRIAL_DAYS = 7;

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
type _BillingStatus = (typeof BILLING_STATUSES)[number];

type BillingInterval = "monthly" | "annual";

type BillingUsagePeriod = {
  start: number;
  end: number;
};

export const PLANS = ["hobby", "basic", "pro"] as const;
export type Plan = (typeof PLANS)[number];
export type WorkspacePlan = "hobby" | Plan | "unlimited";

const WORKSPACE_PLAN_LABELS: Record<WorkspacePlan, string> = {
  hobby: "Hobby",
  basic: "Basic",
  pro: "Pro",
  unlimited: "Unlimited",
};

const WORKSPACE_PLAN_DESCRIPTIONS: Record<Plan, string> = {
  hobby: "Everything you need to get started.",
  basic: "Everything you need to run your form system.",
  pro: "Higher limits for growing teams and mission critical workflows.",
};

const WORKSPACE_PLAN_MONTHLY_PRICE_USD: Record<Plan, number> = {
  hobby: 0,
  basic: 29,
  pro: 99,
};

export const WORKSPACE_PLAN_YEARLY_PRICE_USD_MULTIPLIER = 6;
const WORKSPACE_PLAN_YEAR_MONTHS = 12;
const DAY_MS = 24 * 60 * 60 * 1000;

export function getAnnualBillingMonths() {
  return {
    paid: WORKSPACE_PLAN_YEARLY_PRICE_USD_MULTIPLIER,
    free: WORKSPACE_PLAN_YEAR_MONTHS - WORKSPACE_PLAN_YEARLY_PRICE_USD_MULTIPLIER,
    total: WORKSPACE_PLAN_YEAR_MONTHS,
  };
}

export const WORKSPACE_LIMITS: Record<
  WorkspacePlan,
  {
    members: number | null;
    forms: number | null;
    monthlySubmissions: number | null;
    storageBytes: number | null;
  }
> = {
  hobby: {
    members: null,
    forms: null,
    monthlySubmissions: 5000,
    storageBytes: 10 * GIGABYTE,
  },
  basic: {
    members: null,
    forms: null,
    monthlySubmissions: 100000,
    storageBytes: 100 * GIGABYTE,
  },
  pro: {
    members: null,
    forms: null,
    monthlySubmissions: null,
    storageBytes: 500 * GIGABYTE,
  },
  unlimited: {
    members: null,
    forms: null,
    monthlySubmissions: null,
    storageBytes: null,
  },
} as const;

export function normalizeWorkspacePlan(plan?: WorkspacePlan): WorkspacePlan {
  switch (plan) {
    case "hobby":
    case "unlimited":
    case "basic":
    case "pro":
      return plan;
    default:
      return "hobby";
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
    plan === "hobby" ? "1 workspace" : "Unlimited workspaces",
    formatLimitFeature(limits.members, "seat", "seats"),
    formatLimitFeature(limits.forms, "form", "forms"),
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

export function getStripePriceIdForPlan(plan: Plan, interval: BillingInterval) {
  const details = getPlanDetails(plan);
  const priceId = interval === "annual" ? details.yearlyPriceId : details.monthlyPriceId;
  return hasString(priceId) ? priceId : null;
}

export function resolvePlanFromStripePriceId(stripePriceId: string | undefined | null): {
  plan: Plan;
  interval: BillingInterval;
} | null {
  if (!hasString(stripePriceId)) return null;

  const basicPriceId = process.env.STRIPE_BASIC_MONTHLY_PRICE_ID;
  const basicYearlyPriceId = process.env.STRIPE_BASIC_YEARLY_PRICE_ID;
  const proPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const proYearlyPriceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID;

  if (hasString(basicPriceId) && stripePriceId === basicPriceId) {
    return { plan: "basic", interval: "monthly" };
  }
  if (hasString(basicYearlyPriceId) && stripePriceId === basicYearlyPriceId) {
    return { plan: "basic", interval: "annual" };
  }
  if (hasString(proPriceId) && stripePriceId === proPriceId) {
    return { plan: "pro", interval: "monthly" };
  }
  if (hasString(proYearlyPriceId) && stripePriceId === proYearlyPriceId) {
    return { plan: "pro", interval: "annual" };
  }

  return null;
}

export function getWorkspaceBillingStatusColor(input: {
  billingStatus?: string;
  plan?: WorkspacePlan;
}) {
  const plan = normalizeWorkspacePlan(input.plan);
  const billingStatus = input.billingStatus;

  if (plan === "hobby" && (billingStatus === "not_subscribed" || billingStatus == null)) {
    return "success";
  }

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

export function getWorkspaceBillingStatusLabel(input: {
  billingStatus?: string;
  plan?: WorkspacePlan;
}) {
  const plan = normalizeWorkspacePlan(input.plan);
  if (
    plan === "hobby" &&
    (input.billingStatus === "not_subscribed" || input.billingStatus == null)
  ) {
    return "Free";
  }

  return input.billingStatus ?? "Unknown";
}

export function hasActiveWorkspaceSubscriptionStatus(status: string | undefined | null): boolean {
  return status === "active" || status === "trialing" || status === "past_due";
}

export function hasWorkspacePlanAccess(input: {
  plan?: WorkspacePlan;
  billingStatus?: string | null;
}): boolean {
  const plan = normalizeWorkspacePlan(input.plan);

  switch (plan) {
    case "hobby":
    case "unlimited":
      return true;
    case "basic":
    case "pro":
      return hasActiveWorkspaceSubscriptionStatus(input.billingStatus);
    default: {
      const _exhaustive: never = plan;
      return _exhaustive;
    }
  }
}

export function canCreateOwnedWorkspace(
  ownedWorkspaces: ReadonlyArray<{
    plan?: WorkspacePlan;
    billingStatus?: string | null;
  }>,
): boolean {
  return ownedWorkspaces.every((workspace) => {
    const plan = normalizeWorkspacePlan(workspace.plan);
    switch (plan) {
      case "hobby":
        return false;
      case "unlimited":
        return true;
      case "basic":
      case "pro":
        return hasActiveWorkspaceSubscriptionStatus(workspace.billingStatus);
      default: {
        const _exhaustive: never = plan;
        return _exhaustive;
      }
    }
  });
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

function getUtcCalendarMonthPeriod(now: number): BillingUsagePeriod {
  const date = new Date(now);
  const start = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
  const end = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
  return { start, end };
}

function addUtcMonths(value: number, months: number) {
  const date = new Date(value);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const daysInTargetMonth = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, daysInTargetMonth));
  return date.getTime();
}

function getAnnualMonthlyPeriod(periodEnd: number, now: number): BillingUsagePeriod {
  for (let monthOffset = -11; monthOffset <= 0; monthOffset += 1) {
    const end = addUtcMonths(periodEnd, monthOffset);
    if (now < end) {
      return { start: addUtcMonths(periodEnd, monthOffset - 1), end };
    }
  }

  return { start: addUtcMonths(periodEnd, -1), end: periodEnd };
}

export function getWorkspaceMonthlySubmissionPeriod(
  subscription?: {
    currentPeriodEnd?: number | null;
    priceId?: string | null;
    status?: string | null;
  } | null,
  now = Date.now(),
): BillingUsagePeriod {
  if (!subscription?.currentPeriodEnd) {
    return getUtcCalendarMonthPeriod(now);
  }

  const periodEnd = subscription.currentPeriodEnd * 1000;

  if (subscription.status === "trialing") {
    return {
      start: periodEnd - WORKSPACE_TRIAL_DAYS * DAY_MS,
      end: periodEnd,
    };
  }

  const priceDetails = resolvePlanFromStripePriceId(subscription.priceId);
  if (priceDetails?.interval === "annual") {
    return getAnnualMonthlyPeriod(periodEnd, now);
  }

  return { start: addUtcMonths(periodEnd, -1), end: periodEnd };
}

export function isLimitReached(used: number, limit: number | null) {
  return limit !== null && used >= limit;
}

export async function isWorkspaceLimitReached(
  limit: number | null,
  getUsed: (takeLimit: number) => Promise<number>,
) {
  if (limit === null) return false;
  return isLimitReached(await getUsed(limit), limit);
}

export async function getWorkspaceFormsUsed(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  limit?: number,
) {
  const query = ctx.db
    .query("forms")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId));

  return limit === undefined ? (await query.collect()).length : (await query.take(limit)).length;
}

export async function aggregateWorkspaceSubmissions(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  options?: {
    period?: BillingUsagePeriod;
    limit?: number;
  },
) {
  const period = options?.period;
  const submissionQuery = ctx.db.query("submissions").withIndex("by_workspace_submitted", (q) => {
    const workspaceQuery = q.eq("workspaceId", workspaceId);
    return period
      ? workspaceQuery.gte("submittedTime", period.start).lt("submittedTime", period.end)
      : workspaceQuery;
  });

  const submissions =
    options?.limit === undefined
      ? await submissionQuery.collect()
      : await submissionQuery.take(options.limit);

  const byForm = new Map<
    Id<"forms">,
    {
      submissions: number;
      storageBytes: number;
      lastSubmittedTime: number | null;
    }
  >();
  let totalStorageBytes = 0;

  for (const submission of submissions) {
    totalStorageBytes += submission.bytes;

    const existing = byForm.get(submission.formId);
    if (!existing) {
      byForm.set(submission.formId, {
        submissions: 1,
        storageBytes: submission.bytes,
        lastSubmittedTime: submission.submittedTime,
      });
      continue;
    }

    existing.submissions += 1;
    existing.storageBytes += submission.bytes;
    existing.lastSubmittedTime = submission.submittedTime;
  }

  return { byForm, totalSubmissions: submissions.length, totalStorageBytes };
}

export async function getWorkspaceStorageUsedBytes(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
) {
  const stats = await aggregateWorkspaceSubmissions(ctx, workspaceId);
  return stats.totalStorageBytes;
}

export async function getWorkspaceMonthlySubmissionsUsed(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  period: { start: number; end: number },
  limit?: number,
) {
  const stats = await aggregateWorkspaceSubmissions(ctx, workspaceId, { period, limit });
  return stats.totalSubmissions;
}

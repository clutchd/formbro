import Stripe from "stripe";

export function hasString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

const GIBIBYTE = 1024 ** 3;

export const PLANS = ["basic", "pro"] as const;
export type Plan = (typeof PLANS)[number];

export const PLAN_MONTHLY_PRICE_USD: Record<Plan, number> = {
  basic: 10,
  pro: 25,
};

export const PLAN_YEARLY_PRICE_USD_MULTIPLIER = 10;

export const PLAN_STORAGE_LIMIT_BYTES: Record<Plan, number> = {
  basic: 100 * GIBIBYTE,
  pro: 1024 * GIBIBYTE,
};

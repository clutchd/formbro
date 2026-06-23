import { codes } from "@formbro/shared/result";
import { v, type Validator } from "convex/values";

export const TERABYTE = 1024 ** 4;
export const GIGABYTE = 1024 ** 3;
export const MEGABYTE = 1024 ** 2;
export const KILOBYTE = 1024;

export const numberFormatter = new Intl.NumberFormat("en-US");

export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export const datetimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatUsd(amount: number) {
  const hasCents = !Number.isInteger(amount);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount);
}

export function formatStorage(bytes: number) {
  if (bytes >= 1024 * GIGABYTE) {
    return `${Math.round(bytes / (1024 * GIGABYTE))} TB`;
  }

  if (bytes >= 1024 * MEGABYTE) {
    return `${Math.round(bytes / (1024 * MEGABYTE))} GB`;
  }

  if (bytes >= 1024 * KILOBYTE) {
    return `${Math.round(bytes / (1024 * KILOBYTE))} MB`;
  }

  return `${Math.round(bytes / KILOBYTE)} KB`;
}

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

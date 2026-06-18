import type { ReactNode } from "react";

const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development";
export const IS_PROD = VERCEL_ENV === "production";
const IS_PREVIEW = VERCEL_ENV === "preview";
export const IS_DEV = !IS_PROD && !IS_PREVIEW;

// returns first value if not in development mode, otherwise returns second value
export function rl<T1 extends ReactNode | object, T2 extends ReactNode | object>(
  remote: T1,
  local: T2,
): T1 | T2 {
  return IS_DEV ? local : remote;
}

// returns value only if in development mode
export function devOnly<T>(value: T): T | undefined {
  return IS_DEV ? value : undefined;
}

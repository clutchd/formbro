import { PostHog } from "posthog-node";

const POSTHOG_HOST = "https://us.i.posthog.com";

let posthogServer: PostHog | null = null;

export function getPostHogServer() {
  const token = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!token) return null;

  posthogServer ??= new PostHog(token, {
    flushAt: 1,
    host: POSTHOG_HOST,
  });

  return posthogServer;
}

export function postHogDistinctIdFromCookie(cookieHeader?: string | string[]) {
  const cookie = Array.isArray(cookieHeader) ? cookieHeader.join("; ") : cookieHeader;
  if (!cookie) return undefined;

  for (const part of cookie.split(";")) {
    const [rawName, ...valueParts] = part.trim().split("=");
    if (!rawName?.startsWith("ph_") || !rawName.endsWith("_posthog")) continue;

    const rawValue = valueParts.join("=");
    if (!rawValue) continue;

    try {
      const parsed = JSON.parse(decodeURIComponent(rawValue)) as {
        distinct_id?: unknown;
        distinctID?: unknown;
      };
      const distinctId = parsed.distinct_id ?? parsed.distinctID;
      return typeof distinctId === "string" ? distinctId : undefined;
    } catch {
      continue;
    }
  }

  return undefined;
}

export async function captureServerException(
  error: unknown,
  {
    distinctId,
    properties,
  }: {
    distinctId?: string;
    properties?: Record<string, unknown>;
  } = {},
) {
  const posthog = getPostHogServer();
  if (!posthog) return;

  await posthog.captureExceptionImmediate(error, distinctId, properties);
}

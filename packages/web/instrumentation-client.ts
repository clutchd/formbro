import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (!posthogKey) {
  throw new Error("NEXT_PUBLIC_POSTHOG_KEY is not set");
}

posthog.init(posthogKey, {
  api_host: "/ingest",
  capture_exceptions: {
    capture_console_errors: false,
    capture_unhandled_errors: true,
    capture_unhandled_rejections: true,
  },
  defaults: "2026-01-30",
  logs: {
    captureConsoleLogs: false,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    serviceName: "formbro-web",
    serviceVersion:
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ??
      "local",
  },
  person_profiles: "identified_only",
  ui_host: "https://us.posthog.com",
});

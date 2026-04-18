"use client";

import type { PropsWithChildren } from "react";
import posthog from "posthog-js";
import { PostHogProvider as Provider } from "posthog-js/react";

if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  throw new Error("NEXT_PUBLIC_POSTHOG_KEY is not set");
}

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: "/ingest",
  person_profiles: "identified_only",
});

export function PosthogProvider({ children }: PropsWithChildren) {
  return <Provider client={posthog}>{children}</Provider>;
}

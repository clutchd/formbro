"use client";

import type { Properties } from "posthog-js";
import type { PropsWithChildren } from "react";
import posthog from "posthog-js";
import { PostHogProvider as Provider } from "posthog-js/react";
import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth/client";

const IDENTIFIED_USER_STORAGE_KEY = "formbro.posthog.identified_user_id";
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
let didInitializePosthog = false;

function ensurePosthogInitialized() {
  if (didInitializePosthog) return;
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
  didInitializePosthog = true;
}

function identifiedStorageGet() {
  try {
    return window.localStorage.getItem(IDENTIFIED_USER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function identifiedStorageSet(userId: string) {
  try {
    window.localStorage.setItem(IDENTIFIED_USER_STORAGE_KEY, userId);
  } catch {
    // Ignore storage failures; PostHog's in-memory identity still applies.
  }
}

function identifiedStorageClear() {
  try {
    window.localStorage.removeItem(IDENTIFIED_USER_STORAGE_KEY);
  } catch {
    // Ignore storage failures; the active PostHog instance has already reset.
  }
}

function personProperties({
  email,
  id,
  image,
  name,
}: {
  email?: string | null;
  id: string;
  image?: string | null;
  name?: string | null;
}): Properties {
  const properties: Properties = {
    user_id: id,
  };

  if (email) properties.email = email;
  if (name) properties.name = name;
  if (image) properties.avatar_url = image;

  return properties;
}

type AnalyticsUser = {
  email?: string | null;
  id: string;
  image?: string | null;
  name?: string | null;
};

export function identifyAnalyticsUser(user: AnalyticsUser) {
  ensurePosthogInitialized();
  posthog.identify(user.id, personProperties(user));
  identifiedStorageSet(user.id);
}

export function resetAnalytics() {
  ensurePosthogInitialized();
  posthog.reset();
  identifiedStorageClear();
}

function PosthogIdentity() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const userId = user?.id;
  const userEmail = user?.email;
  const userName = user?.name;
  const userImage = user?.image;
  const identifiedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) return;

    if (!userId) {
      if (identifiedUserIdRef.current || identifiedStorageGet()) {
        resetAnalytics();
        identifiedUserIdRef.current = null;
      }
      return;
    }

    const previousIdentifiedUserId = identifiedUserIdRef.current ?? identifiedStorageGet();
    if (previousIdentifiedUserId && previousIdentifiedUserId !== userId) {
      resetAnalytics();
      identifiedUserIdRef.current = null;
    }

    identifyAnalyticsUser({ email: userEmail, id: userId, image: userImage, name: userName });
    identifiedUserIdRef.current = userId;
  }, [isPending, userEmail, userId, userImage, userName]);

  return null;
}

export function PosthogProvider({ children }: PropsWithChildren) {
  ensurePosthogInitialized();

  return (
    <Provider client={posthog}>
      <PosthogIdentity />
      {children}
    </Provider>
  );
}

export function captureClientException(error: unknown, properties?: Properties) {
  ensurePosthogInitialized();
  posthog.captureException(error, properties);
}

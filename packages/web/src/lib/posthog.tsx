"use client";

import type { Properties } from "posthog-js";
import type { PropsWithChildren } from "react";
import posthog from "posthog-js";
import { PostHogProvider as Provider } from "posthog-js/react";
import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth/client";

const IDENTIFIED_USER_STORAGE_KEY = "formbro.posthog.identified_user_id";
const SERVICE_VERSION =
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ??
  "local";

if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  throw new Error("NEXT_PUBLIC_POSTHOG_KEY is not set");
}

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: "/ingest",
  capture_exceptions: {
    capture_console_errors: false,
    capture_unhandled_errors: true,
    capture_unhandled_rejections: true,
  },
  logs: {
    captureConsoleLogs: false,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    serviceName: "formbro-web",
    serviceVersion: SERVICE_VERSION,
  },
  person_profiles: "identified_only",
});

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

function personSignature({
  email,
  id,
  image,
  name,
}: {
  email?: string | null;
  id: string;
  image?: string | null;
  name?: string | null;
}) {
  return [id, email, name, image].join("\n");
}

function PosthogIdentity() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const userId = user?.id;
  const userEmail = user?.email;
  const userName = user?.name;
  const userImage = user?.image;
  const identifiedUserIdRef = useRef<string | null>(null);
  const identifiedSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) return;

    if (!userId) {
      if (identifiedUserIdRef.current || identifiedStorageGet()) {
        posthog.reset();
        identifiedStorageClear();
        identifiedUserIdRef.current = null;
        identifiedSignatureRef.current = null;
      }
      return;
    }

    const previousIdentifiedUserId = identifiedUserIdRef.current ?? identifiedStorageGet();
    if (previousIdentifiedUserId && previousIdentifiedUserId !== userId) {
      posthog.reset();
      identifiedUserIdRef.current = null;
      identifiedSignatureRef.current = null;
    }

    const person = { email: userEmail, id: userId, image: userImage, name: userName };
    const signature = personSignature(person);
    if (identifiedUserIdRef.current === userId && identifiedSignatureRef.current === signature) {
      return;
    }

    posthog.identify(userId, personProperties(person));
    identifiedStorageSet(userId);
    identifiedUserIdRef.current = userId;
    identifiedSignatureRef.current = signature;
  }, [isPending, userEmail, userId, userImage, userName]);

  return null;
}

export function PosthogProvider({ children }: PropsWithChildren) {
  return (
    <Provider client={posthog}>
      <PosthogIdentity />
      {children}
    </Provider>
  );
}

export function captureClientException(error: unknown, properties?: Properties) {
  posthog.captureException(error, properties);
}

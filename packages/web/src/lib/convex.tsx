"use client";

import type { PropsWithChildren } from "react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "src/lib/auth/client";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function ConvexProvider({ children, token }: PropsWithChildren<{ token?: string }>) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient} initialToken={token}>
      {children}
    </ConvexBetterAuthProvider>
  );
}

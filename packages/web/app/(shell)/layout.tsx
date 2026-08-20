import type { PropsWithChildren } from "react";
import { api } from "@formbro/convex/_generated/api";
import { AppDataProvider } from "app/_data-provider";
import { DevTools } from "@/components/dev-tools";
import { Toaster } from "@/components/sonner";
import { getToken, preloadAuthQuery } from "@/lib/auth/server";
import { ConvexProvider } from "@/lib/convex/client";
import { rl } from "@/lib/env";
import { PosthogProvider } from "@/lib/posthog";

export default async function ShellLayout({ children }: PropsWithChildren) {
  const [token, preloadedAuthUser] = await Promise.all([
    getToken(),
    preloadAuthQuery(api.auth.get),
  ]);

  return (
    <ConvexProvider token={token}>
      <PosthogProvider>
        <AppDataProvider preloadedAuthUser={preloadedAuthUser}>
          {rl(
            children,
            <>
              {children}
              <DevTools />
            </>,
          )}
        </AppDataProvider>
        <Toaster />
      </PosthogProvider>
    </ConvexProvider>
  );
}

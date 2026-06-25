import type { PropsWithChildren } from "react";
import { api } from "@formbro/convex/_generated/api";
import { AppDataProvider } from "app/_data-provider";
import { DevTools } from "@/components/dev-tools";
import { getToken, preloadAuthQuery } from "@/lib/auth/server";
import { ConvexProvider } from "@/lib/convex/client";
import { rl } from "@/lib/env";

export default async function ShellLayout({ children }: PropsWithChildren) {
  const [token, preloadedAuthUser] = await Promise.all([
    getToken(),
    preloadAuthQuery(api.auth.get),
  ]);

  return (
    <ConvexProvider token={token}>
      <AppDataProvider preloadedAuthUser={preloadedAuthUser}>
        {rl(
          children,
          <>
            {children}
            <DevTools />
          </>,
        )}
      </AppDataProvider>
    </ConvexProvider>
  );
}

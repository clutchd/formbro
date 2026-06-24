import type { PropsWithChildren } from "react";
import { api } from "@formbro/convex/_generated/api";
import { fonts } from "@formbro/ui/typography";
import { AppDataProvider } from "app/_data-provider";
import { DevTools } from "@/components/dev-tools";
import { Toaster } from "@/components/sonner";
import { ThemeProvider } from "@/components/theme";
import { getToken, preloadAuthQuery } from "@/lib/auth/server";
import { ConvexProvider } from "@/lib/convex/client";
import { rl } from "@/lib/env";
import { PosthogProvider } from "@/lib/posthog";
import "./globals.css";

export default async function RootLayout({ children }: PropsWithChildren) {
  const [token, preloadedAuthUser] = await Promise.all([
    getToken(),
    preloadAuthQuery(api.auth.get),
  ]);

  return (
    <html lang="en" className={`${fonts.join(" ")} size-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-1 flex-col">
        <ThemeProvider>
          <PosthogProvider>
            <ConvexProvider token={token}>
              <AppDataProvider preloadedAuthUser={preloadedAuthUser}>
                {rl(
                  children,
                  <>
                    {children}
                    <DevTools />
                  </>,
                )}
                <Toaster />
              </AppDataProvider>
            </ConvexProvider>
          </PosthogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

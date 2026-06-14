import type { PropsWithChildren } from "react";
import { api } from "@formbro/convex/_generated/api";
import { fonts } from "@formbro/ui/typography";
import Script from "next/script";
import { DevTools } from "@/components/dev-tools";
import { Toaster } from "@/components/sonner";
import { ThemeProvider } from "@/components/theme";
import { AuthDataProvider } from "@/lib/auth/data-provider";
import { getToken, preloadAuthQuery } from "@/lib/auth/server";
import { ConvexProvider } from "@/lib/convex/client";
import { devOnly, rl } from "@/lib/env";
import { PosthogProvider } from "@/lib/posthog";
import "./globals.css";

export default async function RootLayout({ children }: PropsWithChildren) {
  const [token, preloadedAuthUser] = await Promise.all([
    getToken(),
    preloadAuthQuery(api.auth.get),
  ]);

  return (
    <html lang="en" className={`${fonts.join(" ")} size-full antialiased`} suppressHydrationWarning>
      <head>
        {devOnly(<Script src="https://unpkg.com/react-scan/dist/auto.global.js" async />)}
      </head>
      <body className="flex min-h-screen flex-1 flex-col">
        <ThemeProvider>
          <PosthogProvider>
            <ConvexProvider token={token}>
              <AuthDataProvider preloadedAuthUser={preloadedAuthUser}>
                {rl(
                  children,
                  <>
                    {children}
                    <DevTools />
                  </>,
                )}
                <Toaster />
              </AuthDataProvider>
            </ConvexProvider>
          </PosthogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

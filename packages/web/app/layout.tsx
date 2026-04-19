import type { PropsWithChildren } from "react";
import { Geist_Mono, Inter, Manrope } from "next/font/google";
import Script from "next/script";
import { DevTools } from "@/components/dev-tools";
import { Toaster } from "@/components/sonner";
import { ThemeProvider } from "@/components/theme";
import { getToken } from "@/lib/auth/server";
import { ConvexProvider } from "@/lib/convex/client";
import { devOnly, rl } from "@/lib/env";
import { PosthogProvider } from "@/lib/posthog";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({ children }: PropsWithChildren) {
  const token = await getToken();
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${geistMono.variable} size-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {devOnly(<Script src="https://unpkg.com/react-scan/dist/auto.global.js" async />)}
      </head>
      <body className="flex min-h-screen flex-1 flex-col">
        <ThemeProvider>
          <PosthogProvider>
            <ConvexProvider token={token}>
              {rl(
                children,
                <>
                  {children}
                  <DevTools />
                </>,
              )}
              <Toaster />
            </ConvexProvider>
          </PosthogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "@formbro/shared/brand";
import { fonts } from "@formbro/ui/typography";
import { Toaster } from "@/components/sonner";
import { ThemeProvider } from "@/components/theme";
import { PosthogProvider } from "@/lib/posthog";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={`${fonts.join(" ")} size-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-1 flex-col">
        <ThemeProvider>
          <PosthogProvider>
            {children}
            <Toaster />
          </PosthogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

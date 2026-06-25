import type { PropsWithChildren } from "react";
import { fonts } from "@formbro/ui/typography";
import { Toaster } from "@/components/sonner";
import { ThemeProvider } from "@/components/theme";
import { PosthogProvider } from "@/lib/posthog";
import "./globals.css";

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

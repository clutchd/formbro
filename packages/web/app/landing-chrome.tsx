"use client";

import type { ReactNode } from "react";
import { APP_NAME, TAGLINE } from "@formbro/shared/brand";
import { Button } from "@formbro/ui/button";
import { Logo } from "@formbro/ui/logo";
import { RiGithubFill } from "@remixicon/react";
import { useAppData } from "app/_data-provider";
import Link from "next/link";
import { ThemeIcon, useToggleTheme } from "@/components/theme";
import { useDashboardPrewarmIntent } from "./(shell)/(app)/dashboard/(dashboard)/_data-provider";

const COPYRIGHT_YEAR = 2026;

const LANDING_NAV = [
  { href: "/#builder", label: "Builder" },
  { href: "/templates", label: "Templates" },
  { href: "/#workflow", label: "Workflow" },
  { href: "/#pricing", label: "Pricing" },
] as const;

export function LandingHeader() {
  const { authUser } = useAppData();
  const isAuthenticated = Boolean(authUser?.ok && authUser.data);
  const dashboardPrewarmIntent = useDashboardPrewarmIntent({ eager: true });

  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <Link href="/" aria-label={`${APP_NAME} home`}>
        <Logo />
      </Link>
      <nav className="hidden items-center gap-6 font-mono text-xs tracking-wider text-muted-foreground uppercase md:flex">
        {LANDING_NAV.map((item) => (
          <Link key={item.href} href={item.href} className="hover:text-foreground">
            {item.label}
          </Link>
        ))}
      </nav>
      {isAuthenticated ? (
        <Button asChild variant="outline">
          <Link {...dashboardPrewarmIntent}>Dashboard</Link>
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button asChild variant="link" className="hidden sm:inline-flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Start for free</Link>
          </Button>
        </div>
      )}
    </header>
  );
}

export function LandingFooter() {
  const { isDark, toggle } = useToggleTheme();

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo className="text-xl" />
          <p className="mt-2 text-sm text-muted-foreground">
            © {COPYRIGHT_YEAR} Clutchd, LLC. {TAGLINE}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="dense">
            <Link href="/templates">Templates</Link>
          </Button>
          <Button asChild variant="outline" size="dense">
            <Link href="https://github.com/clutchd/formbro" target="_blank" rel="noreferrer">
              <RiGithubFill className="size-4" />
              GitHub
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="dense"
            onClick={toggle}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            <ThemeIcon />
            {isDark ? "Light mode" : "Dark mode"}
          </Button>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <LandingHeader />
      <main>{children}</main>
      <LandingFooter />
    </div>
  );
}

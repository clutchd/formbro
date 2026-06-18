"use client";

import { TypographyH1 } from "@formbro/ui/typography";
import { useAppData } from "app/_data-provider";
import Link from "next/link";
import { useDashboardPrewarmIntent } from "./(app)/dashboard/(dashboard)/_data-provider";

export function HomePage() {
  const { authUser } = useAppData();
  const user = authUser?.ok ? authUser.data : null;
  const dashboardPrewarmIntent = useDashboardPrewarmIntent({ eager: true });

  return (
    <div>
      <TypographyH1>Welcome to FormBro!</TypographyH1>
      {user ? (
        <Link {...dashboardPrewarmIntent}>Dashboard</Link>
      ) : (
        <>
          <Link href="/sign-in">Sign in</Link>
          <Link href="/sign-up">Sign up</Link>
        </>
      )}
    </div>
  );
}

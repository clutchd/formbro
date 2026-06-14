"use client";

import { TypographyH1 } from "@formbro/ui/typography";
import { useAppData } from "app/data-provider";
import Link from "next/link";
import { useDashboardPrewarmIntent } from "./(app)/dashboard/(dashboard)/data-provider";

export default function Home() {
  const { authUser } = useAppData();
  const user = authUser.ok ? authUser.data : null;
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

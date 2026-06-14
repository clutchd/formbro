"use client";

import { TypographyH1 } from "@formbro/ui/typography";
import Link from "next/link";
import { useAuthData } from "@/lib/auth/data-provider";
import { useDashboardPrewarmIntent } from "./(app)/dashboard/(dashboard)/data-provider";

export default function Home() {
  const { authUser } = useAuthData();
  const user = authUser.ok ? authUser.data : null;
  const dashboardPrewarmIntent = useDashboardPrewarmIntent();

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

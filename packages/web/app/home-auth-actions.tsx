"use client";

import { Button } from "@formbro/ui/button";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useSession } from "@/lib/auth/client";

const subscribeToHydration = () => () => {};

export function HomeAuthActions() {
  const { data: session, isPending } = useSession();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const isAuthenticated = isHydrated && Boolean(session?.user);

  if (isAuthenticated) {
    return (
      <Button asChild variant="outline">
        <Link href="/dashboard" prefetch>
          Dashboard
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isHydrated && !isPending ? (
        <Button asChild variant="link" className="hidden sm:inline-flex">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      ) : null}
      <Button asChild>
        <Link href="/sign-up">Start trial</Link>
      </Button>
    </div>
  );
}

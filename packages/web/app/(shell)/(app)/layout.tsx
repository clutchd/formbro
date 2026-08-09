"use client";

import { useAppData } from "app/_data-provider";
import { redirect, usePathname } from "next/navigation";
import { Loading } from "@/components/loading";
import { authHref } from "@/lib/auth/callback-url";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { authUser } = useAppData();
  const pathname = usePathname();

  if (authUser === undefined) {
    return <Loading />;
  }

  if (!authUser?.ok) {
    redirect(authHref("/sign-in", pathname));
  }

  return children;
}

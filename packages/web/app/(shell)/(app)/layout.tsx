"use client";

import { useAppData } from "app/_data-provider";
import { redirect, usePathname, useSearchParams } from "next/navigation";
import { Loading } from "@/components/loading";
import { authHref } from "@/lib/auth/callback-url";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { authUser } = useAppData();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (authUser === undefined) {
    return <Loading />;
  }

  if (!authUser?.ok) {
    const search = searchParams.toString();
    redirect(authHref("/sign-in", search ? `${pathname}?${search}` : pathname));
  }

  return children;
}

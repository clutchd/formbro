"use client";

import { useAppData } from "app/data-provider";
import { redirect } from "next/navigation";
import { Loading } from "@/components/loading";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { authUser } = useAppData();

  if (authUser === undefined) {
    return <Loading />;
  }

  if (!authUser?.ok) {
    redirect("/sign-in");
  }

  return children;
}

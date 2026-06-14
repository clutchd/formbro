"use client";

import { useAppData } from "app/data-provider";
import { redirect } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { authUser } = useAppData();

  if (!authUser.ok) {
    redirect("/sign-in");
  }

  return children;
}

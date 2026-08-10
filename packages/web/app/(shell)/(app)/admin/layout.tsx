import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { requireAdminPage } from "@/lib/auth/admin";
import { DashboardHeader } from "../dashboard/header";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: PropsWithChildren) {
  await requireAdminPage();

  return (
    <>
      <DashboardHeader breadcrumbs={[{ label: "Admin" }]} />
      {children}
    </>
  );
}

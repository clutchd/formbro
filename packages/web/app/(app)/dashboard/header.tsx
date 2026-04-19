"use client";

import { Logo } from "@formbro/ui/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { useAppData } from "../data-provider";
import { useDashboardPrewarmIntent } from "./(dashboard)/data-provider";
import { AccountMenu } from "./account-menu";

function formatSegment(segment: string) {
  return decodeURIComponent(segment)
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function DashboardHeader({ children = null }: { children?: React.ReactNode }) {
  const { authUser } = useAppData();
  const pathname = usePathname();
  const segments = pathname
    .replace(/^\/dashboard/, "")
    .split("/")
    .filter(Boolean);
  const labels = segments.map((segment) => formatSegment(segment));

  return (
    <header className="sticky top-0 z-50 mx-auto flex w-full flex-row items-center justify-between border-b bg-sidebar px-5 py-3">
      <div className="flex flex-row items-center gap-4">
        <Link {...useDashboardPrewarmIntent()}>
          <Logo className="text-center text-xl hover:opacity-80" />
        </Link>

        {labels.map((label, index) => (
          <Fragment key={segments.slice(0, index + 1).join("/")}>
            <span className="pointer-events-none font-display font-bold opacity-20 select-none">
              /
            </span>
            <Link
              href={`/dashboard/${segments.slice(0, index + 1).join("/")}`}
              className="font-display font-bold tracking-tight hover:opacity-80"
            >
              {label}
            </Link>
          </Fragment>
        ))}
      </div>
      <div className="flex h-8 flex-row items-center gap-3">
        {children}
        <AccountMenu user={authUser} />
      </div>
    </header>
  );
}

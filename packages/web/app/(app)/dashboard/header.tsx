"use client";

import { Logo } from "@formbro/ui/logo";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { useAppData } from "../data-provider";
import { useDashboardPrewarmIntent } from "./(dashboard)/data-provider";
import { AccountMenu } from "./account-menu";

type DashboardBreadcrumb = {
  href?: string;
  key?: string;
  label: ReactNode;
};

export function DashboardHeader({
  actions = null,
  breadcrumbs = [],
}: {
  actions?: ReactNode;
  breadcrumbs?: DashboardBreadcrumb[];
}) {
  const { authUser } = useAppData();
  const dashboardPrewarmIntent = useDashboardPrewarmIntent();
  const user = authUser.ok ? authUser.data : null;

  return (
    <header className="sticky top-0 z-50 mx-auto flex w-full flex-row items-center justify-between gap-4 border-b bg-sidebar px-5 py-3">
      <div className="flex min-w-0 flex-1 flex-row items-center gap-4">
        <Link {...dashboardPrewarmIntent} className="shrink-0">
          <Logo className="text-center text-xl hover:opacity-80" />
        </Link>

        {breadcrumbs.map((breadcrumb, index) => {
          const isCurrent = index === breadcrumbs.length - 1;
          const labelClassName =
            "block min-w-0 max-w-[18rem] truncate font-display font-bold tracking-tight text-center text-xl";

          return (
            <Fragment key={breadcrumb.href ?? breadcrumb.key ?? index}>
              <span className="pointer-events-none font-display font-bold opacity-20 select-none">
                /
              </span>
              <div className="flex min-w-0 flex-row items-center gap-2">
                {breadcrumb.href ? (
                  <Link
                    href={breadcrumb.href}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`${labelClassName} hover:opacity-80`}
                  >
                    {breadcrumb.label}
                  </Link>
                ) : (
                  <span aria-current={isCurrent ? "page" : undefined} className={labelClassName}>
                    {breadcrumb.label}
                  </span>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
      <div className="flex h-8 shrink-0 flex-row items-center gap-3">
        {actions}
        <AccountMenu user={user} />
      </div>
    </header>
  );
}

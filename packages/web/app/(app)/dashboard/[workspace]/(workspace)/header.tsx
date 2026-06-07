"use client";

import { Button } from "@formbro/ui/button";
import { RiBankCardLine } from "@remixicon/react";
import Link from "next/link";
import { DashboardHeader } from "../../header";
import { WorkspacePlanBadge } from "../../workspace-plan-badge";
import { CreateForm } from "../create-form-form";
import { useWorkspaceData } from "../data-provider";

type Workspace = NonNullable<ReturnType<typeof useWorkspaceData>["workspace"]>;

function WorkspaceBreadcrumbLabel({ workspace }: { workspace: Workspace }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="truncate">{workspace.name}</span>
      <WorkspacePlanBadge workspace={workspace} size="sm" />
    </span>
  );
}

export function WorkspaceHomeHeader() {
  const { forms, workspace } = useWorkspaceData();

  return (
    <DashboardHeader
      breadcrumbs={
        workspace
          ? [
              {
                href: `/dashboard/${workspace.slug}`,
                label: <WorkspaceBreadcrumbLabel workspace={workspace} />,
              },
            ]
          : []
      }
      actions={
        workspace ? (
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href={`/dashboard/${workspace.slug}/settings`}>
                <RiBankCardLine className="size-4" />
                Billing
              </Link>
            </Button>
            {forms && forms.length > 0 ? <CreateForm /> : null}
          </div>
        ) : null
      }
    />
  );
}

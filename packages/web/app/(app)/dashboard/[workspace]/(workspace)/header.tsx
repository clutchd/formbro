"use client";

import {
  getWorkspacePlanLabel,
  hasActiveWorkspaceSubscriptionStatus,
} from "@formbro/convex/billingUtils";
import { Button } from "@formbro/ui/button";
import { RiBankCardLine } from "@remixicon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardHeader } from "../../header";
import { WorkspaceBillingStateBadge } from "../../workspace-billing-state-badge";
import { useWorkspaceData } from "../_data-provider";
import { CreateForm } from "../create-form-form";
import { useWorkspaceSettingsPrewarmIntent } from "../settings/_data-provider";

type Workspace = NonNullable<ReturnType<typeof useWorkspaceData>["workspace"]>;

function WorkspaceBreadcrumbLabel({ workspace }: { workspace: Workspace }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="truncate">{workspace.name}</span>
      <WorkspaceBillingStateBadge workspace={workspace} size="sm">
        {getWorkspacePlanLabel(workspace.plan)}
      </WorkspaceBillingStateBadge>
    </span>
  );
}

export function WorkspaceHomeHeader() {
  const { workspace: workspaceSlug } = useParams<{ workspace: string }>();
  const { forms, workspace } = useWorkspaceData();
  const settingsPrewarm = useWorkspaceSettingsPrewarmIntent(workspaceSlug);

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
              <Link {...settingsPrewarm}>
                <RiBankCardLine className="size-4" />
                Billing
              </Link>
            </Button>
            {forms && !forms.length && hasActiveWorkspaceSubscriptionStatus(workspace) ? (
              <CreateForm />
            ) : null}
          </div>
        ) : null
      }
    />
  );
}

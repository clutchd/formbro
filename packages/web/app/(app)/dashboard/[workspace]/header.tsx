"use client";

import { WorkspacePlanBadge } from "../(dashboard)/workspace-card";
import { DashboardHeader } from "../header";
import { CreateForm } from "./create-form-form";
import { useWorkspaceData } from "./data-provider";

export function WorkspaceHeader() {
  const { forms, workspace } = useWorkspaceData();
  return (
    <DashboardHeader
      breadcrumbs={
        workspace
          ? [
              {
                href: `/dashboard/${workspace.slug}`,
                label: workspace.name,
              },
            ]
          : []
      }
      actions={forms && forms.length > 0 ? <CreateForm /> : null}
    />
  );
}

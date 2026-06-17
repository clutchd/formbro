"use client";

import { useParams } from "next/navigation";
import { DashboardHeader } from "../../header";
import { useWorkspaceData, useWorkspacePrewarmIntent } from "../data-provider";

export function WorkspaceSettingsHeader() {
  const { workspace: workspaceSlug } = useParams<{ workspace: string }>();
  const { workspace } = useWorkspaceData();
  const workspacePrewarm = useWorkspacePrewarmIntent(workspaceSlug);

  return (
    <DashboardHeader
      breadcrumbs={
        workspace
          ? [
              {
                href: `/dashboard/${workspace.slug}`,
                label: workspace.name,
                prewarm: workspacePrewarm,
              },
              {
                key: "settings",
                label: "Settings",
              },
            ]
          : []
      }
    />
  );
}

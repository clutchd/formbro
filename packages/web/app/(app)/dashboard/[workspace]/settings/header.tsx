"use client";

import { DashboardHeader } from "../../header";
import { useWorkspaceData, useWorkspacePrewarmIntent } from "../data-provider";

export function WorkspaceSettingsHeader() {
  const { workspace } = useWorkspaceData();

  return (
    <DashboardHeader
      breadcrumbs={
        workspace
          ? [
              {
                href: `/dashboard/${workspace.slug}`,
                label: workspace.name,
                prewarm: useWorkspacePrewarmIntent(workspace.slug),
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

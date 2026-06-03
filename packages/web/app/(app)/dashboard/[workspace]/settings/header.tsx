"use client";

import { DashboardHeader } from "../../header";
import { useWorkspaceData } from "../data-provider";

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

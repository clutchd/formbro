"use client";

import { DashboardHeader } from "../header";
import { useDashboardData } from "./_data-provider";
import { CreateWorkspace } from "./create-workspace-form";

export function AllWorkspacesHeader() {
  const { workspaces } = useDashboardData();
  return (
    <DashboardHeader
      actions={workspaces?.ok && workspaces.data.length ? <CreateWorkspace /> : null}
    />
  );
}

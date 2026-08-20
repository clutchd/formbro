"use client";

import { DashboardHeader } from "../header";
import { useDashboardData } from "./_data-provider";
import { CreateWorkspace } from "./create-workspace-form";

export function AllWorkspacesHeader() {
  const { workspaces } = useDashboardData();
  const canCreate = workspaces?.ok && workspaces.data.length > 0;

  return <DashboardHeader actions={canCreate ? <CreateWorkspace /> : null} />;
}

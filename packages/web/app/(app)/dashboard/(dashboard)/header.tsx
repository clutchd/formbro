"use client";

import { DashboardHeader } from "../header";
import { CreateWorkspace } from "./create-workspace-form";
import { useDashboardData } from "./data-provider";

export function AllWorkspacesHeader() {
  const { workspaces, isLoading } = useDashboardData();
  return (
    <DashboardHeader actions={!isLoading && workspaces.length > 0 ? <CreateWorkspace /> : null} />
  );
}

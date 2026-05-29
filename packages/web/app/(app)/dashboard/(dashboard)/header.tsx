"use client";

import { DashboardHeader } from "../header";
import { CreateWorkspace } from "./create-workspace-form";
import { useDashboardData } from "./data-provider";

export function AllWorkspacesHeader() {
  const { workspaces, loading } = useDashboardData();
  return (
    <DashboardHeader actions={!loading && workspaces.length > 0 ? <CreateWorkspace /> : null} />
  );
}

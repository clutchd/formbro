"use client";

import { DashboardHeader } from "../header";
import { CreateWorkspace } from "./create-workspace-form";
import { useDashboardData } from "./data-provider";

export function AllWorkspacesHeader() {
  const { workspaces } = useDashboardData();
  return <DashboardHeader actions={workspaces?.length ? <CreateWorkspace /> : null} />;
}

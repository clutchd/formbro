"use client";

import { RiTeamLine } from "@remixicon/react";
import { Loading } from "@/components/loading";
import { Page } from "@/components/page";
import { PageState } from "@/components/page-state";
import { CreateWorkspace } from "./create-workspace-form";
import { useDashboardData } from "./data-provider";
import { WorkspaceCard } from "./workspace-card";

export default function DashboardContent() {
  const { workspaces } = useDashboardData();

  if (!workspaces) {
    return <Loading title="workspaces" />;
  }

  if (workspaces.length === 0) {
    return (
      <PageState
        icon={<RiTeamLine />}
        title="No workspaces yet"
        description="Create your first workspace to get started"
      >
        <CreateWorkspace />
      </PageState>
    );
  }

  return (
    <Page>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">All Workspaces</h1>
        <p className="mt-1 font-mono text-xs tracking-wider text-muted-foreground uppercase">
          {workspaces.length} workspace{workspaces.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <WorkspaceCard key={workspace._id} workspace={workspace} />
        ))}
      </div>
    </Page>
  );
}

"use client";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@formbro/ui/empty";
import { RiTeamLine } from "@remixicon/react";
import { Loading } from "@/components/loading";
import { CreateWorkspace } from "./create-workspace-form";
import { useDashboardData } from "./data-provider";
import { WorkspaceCard } from "./workspace-card";

function EmptyDashboard() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiTeamLine />
        </EmptyMedia>
        <EmptyTitle>No workspaces yet</EmptyTitle>
        <EmptyDescription>Create your first workspace to get started</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <CreateWorkspace />
        </div>
      </EmptyContent>
    </Empty>
  );
}

export default function DashboardContent() {
  const { workspaces, loading } = useDashboardData();

  if (loading) {
    return <Loading />;
  }

  if (workspaces.length === 0) {
    return <EmptyDashboard />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8">
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
    </div>
  );
}

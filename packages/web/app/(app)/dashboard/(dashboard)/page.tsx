"use client";

import { TypographyH1, TypographySubheading } from "@formbro/ui/typography";
import { RiTeamLine } from "@remixicon/react";
import { Loading } from "@/components/loading";
import { Page } from "@/components/page";
import { PageState } from "@/components/page-state";
import { CreateWorkspace } from "./create-workspace-form";
import { useDashboardData } from "./data-provider";
import { WorkspaceCard } from "./workspace-card";

export default function DashboardContent() {
  const { workspaces } = useDashboardData();

  if (!workspaces?.ok) {
    return <Loading title="workspaces" />;
  }

  if (workspaces.data.length === 0) {
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
        <TypographyH1>All Workspaces</TypographyH1>
        <TypographySubheading>
          {workspaces.data.length} workspace{workspaces.data.length === 1 ? "" : "s"}
        </TypographySubheading>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces.data.map((workspace) => (
          <WorkspaceCard key={workspace._id} workspace={workspace} />
        ))}
      </div>
    </Page>
  );
}

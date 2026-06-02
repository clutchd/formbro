"use client";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@formbro/ui/empty";
import { RiErrorWarningLine, RiFileAiLine, RiLoader4Line } from "@remixicon/react";
import { CreateForm } from "./create-form-form";
import { useWorkspaceData } from "./data-provider";

function WorkspaceLoadingState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiLoader4Line className="animate-spin" />
        </EmptyMedia>
        <EmptyTitle>Loading workspace</EmptyTitle>
        <EmptyDescription>Fetching workspace data and forms.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function WorkspaceMissingState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiErrorWarningLine />
        </EmptyMedia>
        <EmptyTitle>Workspace not found</EmptyTitle>
        <EmptyDescription>
          This workspace does not exist or you no longer have access.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function EmptyFormsDashboard() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <RiFileAiLine />
        </EmptyMedia>
        <EmptyTitle>No forms yet</EmptyTitle>
        <EmptyDescription>Create your first form to start collecting data</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CreateForm />
      </EmptyContent>
    </Empty>
  );
}

export default function FormsDashboardContent() {
  const { isLoading, isNotFound } = useWorkspaceData();

  if (isLoading) {
    return <WorkspaceLoadingState />;
  }

  if (isNotFound) {
    return <WorkspaceMissingState />;
  }

  return <EmptyFormsDashboard />;
}

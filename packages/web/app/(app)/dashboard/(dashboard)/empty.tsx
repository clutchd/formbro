import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@formbro/ui/empty";
import { RiTeamLine } from "@remixicon/react";
import { CreateWorkspace } from "./create-workspace-form";

export function EmptyDashboard() {
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

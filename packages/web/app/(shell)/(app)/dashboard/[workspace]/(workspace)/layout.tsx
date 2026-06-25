import { WorkspaceContentBoundary } from "../_data-provider";
import { WorkspaceHomeHeader } from "./header";

export default function WorkspaceHomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WorkspaceHomeHeader />
      <WorkspaceContentBoundary>{children}</WorkspaceContentBoundary>
    </>
  );
}

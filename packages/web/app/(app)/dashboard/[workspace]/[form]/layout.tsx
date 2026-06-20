import { WorkspaceContentBoundary } from "../_data-provider";
import { WorkspaceFormContentBoundary, WorkspaceFormDataProvider } from "./_data-provider";
import { WorkspaceFormHeader } from "./header";

export default function WorkspaceFormLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceContentBoundary>
      <WorkspaceFormDataProvider>
        <WorkspaceFormHeader />
        <WorkspaceFormContentBoundary>{children}</WorkspaceFormContentBoundary>
      </WorkspaceFormDataProvider>
    </WorkspaceContentBoundary>
  );
}

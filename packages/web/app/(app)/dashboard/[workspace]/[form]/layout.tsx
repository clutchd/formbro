import { WorkspaceFormContentBoundary, WorkspaceFormDataProvider } from "./_data-provider";
import { WorkspaceFormHeader } from "./header";

export default function WorkspaceFormLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceFormDataProvider>
      <WorkspaceFormHeader />
      <WorkspaceFormContentBoundary>{children}</WorkspaceFormContentBoundary>
    </WorkspaceFormDataProvider>
  );
}

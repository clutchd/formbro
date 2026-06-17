import { WorkspaceContentBoundary } from "../data-provider";
import { WorkspaceSettingsContentBoundary, WorkspaceSettingsDataProvider } from "./data-provider";
import { WorkspaceSettingsHeader } from "./header";

export default function WorkspaceSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WorkspaceSettingsHeader />
      <WorkspaceContentBoundary>
        <WorkspaceSettingsDataProvider>
          <WorkspaceSettingsContentBoundary>{children}</WorkspaceSettingsContentBoundary>
        </WorkspaceSettingsDataProvider>
      </WorkspaceContentBoundary>
    </>
  );
}

import { WorkspaceContentBoundary } from "../_data-provider";
import { WorkspaceSettingsContentBoundary, WorkspaceSettingsDataProvider } from "./_data-provider";
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

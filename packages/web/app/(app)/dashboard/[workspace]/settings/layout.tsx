import { WorkspaceSettingsHeader } from "./header";

export default function WorkspaceSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WorkspaceSettingsHeader />
      {children}
    </>
  );
}

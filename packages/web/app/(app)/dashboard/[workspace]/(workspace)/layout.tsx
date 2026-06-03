import { WorkspaceHomeHeader } from "./header";

export default function WorkspaceHomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WorkspaceHomeHeader />
      {children}
    </>
  );
}

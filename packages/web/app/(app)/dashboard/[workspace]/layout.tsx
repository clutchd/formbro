import { WorkspaceDataProvider } from "./data-provider";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceDataProvider>{children}</WorkspaceDataProvider>;
}

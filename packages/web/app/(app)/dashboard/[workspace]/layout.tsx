import { WorkspaceDataProvider } from "./data-provider";
import { WorkspaceHeader } from "./header";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;

  return (
    <WorkspaceDataProvider workspaceSlug={slug}>
      <WorkspaceHeader />
      {children}
    </WorkspaceDataProvider>
  );
}

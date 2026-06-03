import { WorkspaceDataProvider } from "./data-provider";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;

  return <WorkspaceDataProvider workspaceSlug={slug}>{children}</WorkspaceDataProvider>;
}

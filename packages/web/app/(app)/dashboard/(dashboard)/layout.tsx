import { api } from "@formbro/convex/_generated/api";
import { preloadAuthQuery } from "@/lib/auth/server";
import { DashboardDataProvider } from "./data-provider";
import { AllWorkspacesHeader } from "./header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [preloadedWorkspaces] = await Promise.all([preloadAuthQuery(api.workspace.list)]);

  return (
    <DashboardDataProvider preloadedWorkspaces={preloadedWorkspaces}>
      <AllWorkspacesHeader />
      {children}
    </DashboardDataProvider>
  );
}

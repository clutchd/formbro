import { DashboardDataProvider } from "./data-provider";
import { AllWorkspacesHeader } from "./header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardDataProvider>
      <AllWorkspacesHeader />
      {children}
    </DashboardDataProvider>
  );
}

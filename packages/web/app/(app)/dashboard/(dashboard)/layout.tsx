import { DashboardDataProvider } from "./_data-provider";
import { AllWorkspacesHeader } from "./header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardDataProvider>
      <AllWorkspacesHeader />
      {children}
    </DashboardDataProvider>
  );
}

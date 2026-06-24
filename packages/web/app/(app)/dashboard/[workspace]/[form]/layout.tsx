"use client";

import { Sidebar, SidebarInset, SidebarProvider } from "@formbro/ui/sidebar";
import { WorkspaceFormContentBoundary, WorkspaceFormDataProvider } from "./_data-provider";
import { FormSidebar } from "./form-sidebar";
import { WorkspaceFormHeader } from "./header";

export default function WorkspaceFormLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceFormDataProvider>
      <div className="flex h-svh flex-col overflow-hidden">
        <div className="shrink-0">
          <WorkspaceFormHeader />
        </div>
        <WorkspaceFormContentBoundary>
          <SidebarProvider className="h-full min-h-0 flex-1 overflow-hidden" defaultOpen={true}>
            <div className="flex min-h-0 flex-1 overflow-hidden bg-sidebar">
              <Sidebar className="relative w-50 shrink-0 border-r">
                <FormSidebar />
              </Sidebar>
              <SidebarInset className="min-h-0 overflow-hidden">{children}</SidebarInset>
            </div>
          </SidebarProvider>
        </WorkspaceFormContentBoundary>
      </div>
    </WorkspaceFormDataProvider>
  );
}

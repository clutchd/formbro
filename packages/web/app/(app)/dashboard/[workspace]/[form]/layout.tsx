"use client";

import { Sidebar, SidebarInset, SidebarProvider } from "@formbro/ui/sidebar";
import { WorkspaceFormContentBoundary, WorkspaceFormDataProvider } from "./_data-provider";
import { FormSidebar } from "./form-sidebar";
import { WorkspaceFormHeader } from "./header";

export default function WorkspaceFormLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceFormDataProvider>
      <WorkspaceFormHeader />
      <WorkspaceFormContentBoundary>
        <SidebarProvider defaultOpen={true} className="flex h-screen flex-col">
          <div className="flex flex-1 overflow-hidden bg-sidebar">
            <Sidebar className="relative w-50 shrink-0 border-r">
              <FormSidebar />
            </Sidebar>
            <SidebarInset>{children}</SidebarInset>
          </div>
        </SidebarProvider>
      </WorkspaceFormContentBoundary>
    </WorkspaceFormDataProvider>
  );
}

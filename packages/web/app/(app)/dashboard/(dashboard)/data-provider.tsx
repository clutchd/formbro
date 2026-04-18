"use client";

import type { api } from "@formbro/convex/_generated/api";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import { createContext, useContext, type ReactNode } from "react";

const DashboardDataContext = createContext<{
  workspaces: Awaited<ReturnType<typeof usePreloadedQuery<typeof api.workspace.list>>>;
} | null>(null);

export function DashboardDataProvider({
  preloadedWorkspaces,
  children,
}: {
  preloadedWorkspaces: Preloaded<typeof api.workspace.list>;
  children: ReactNode;
}) {
  const workspaces = usePreloadedQuery(preloadedWorkspaces);

  return (
    <DashboardDataContext.Provider value={{ workspaces }}>{children}</DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const value = useContext(DashboardDataContext);

  if (!value) {
    throw new Error("useDashboardData must be used within DashboardDataProvider");
  }

  return value;
}

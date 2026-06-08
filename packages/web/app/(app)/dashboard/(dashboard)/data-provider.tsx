"use client";

import { api } from "@formbro/convex/_generated/api";
import { useConvex, useQuery } from "convex/react";
import { createContext, useContext, type ReactNode } from "react";
import { nextUseRoutePrewarmIntent } from "@/lib/convex/next-use-route-prewarm-intent";
import { makeRouteQuerySpec, prewarmSpecs } from "@/lib/convex/route-data";

export function useDashboardPrewarmIntent() {
  const convex = useConvex();
  return nextUseRoutePrewarmIntent("/dashboard", () => {
    prewarmSpecs(convex, [makeRouteQuerySpec(api.workspace.list, {})]);
  });
}

type WorkspacesResult = Awaited<ReturnType<typeof useQuery<typeof api.workspace.list>>>;
type Workspaces = NonNullable<WorkspacesResult>["data"];

const DashboardDataContext = createContext<{
  workspaces: Workspaces;
  isLoading: boolean;
} | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const workspacesQuery = useQuery(api.workspace.list);
  const workspaces = workspacesQuery?.data ?? [];
  const isLoading = workspacesQuery === undefined;

  return (
    <DashboardDataContext.Provider value={{ workspaces, isLoading }}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const value = useContext(DashboardDataContext);

  if (!value) {
    throw new Error("useDashboardData must be used within DashboardDataProvider");
  }

  return value;
}

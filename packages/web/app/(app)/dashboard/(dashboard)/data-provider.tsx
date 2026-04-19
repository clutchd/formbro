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

const DashboardDataContext = createContext<{
  workspaces: NonNullable<Awaited<ReturnType<typeof useQuery<typeof api.workspace.list>>>>;
  loading: boolean;
} | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const workspacesQuery = useQuery(api.workspace.list);
  const workspaces = workspacesQuery ?? [];
  const loading = workspacesQuery === undefined;

  return (
    <DashboardDataContext.Provider value={{ workspaces, loading }}>
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

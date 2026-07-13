"use client";

import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { api } from "@formbro/convex/_generated/api";
import { useConvex, useQuery, type ConvexReactClient } from "convex/react";
import { useMemo } from "react";
import {
  prewarmRoute,
  routeQuery,
  useRoutePrewarm,
  type RoutePrewarmOptions,
} from "@/lib/convex/route-prewarm";
import { createSegmentData } from "@/lib/data-segment";

const dashboard = createSegmentData<{
  workspaces: FunctionReturnType<typeof api.workspace.list> | undefined;
}>("Dashboard");

const DASHBOARD_HREF = "/dashboard";

function dashboardPrewarm(convex: ConvexReactClient) {
  prewarmRoute(convex, [routeQuery(api.workspace.list, {})]);
}

export function useDashboardPrewarmIntent(options: RoutePrewarmOptions = {}) {
  const convex = useConvex();
  return useRoutePrewarm(DASHBOARD_HREF, () => dashboardPrewarm(convex), options);
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const workspaces = useQuery(api.workspace.list, {});
  const value = useMemo(() => ({ workspaces }), [workspaces]);
  return <dashboard.Provider value={value}>{children}</dashboard.Provider>;
}

export const useDashboardData = dashboard.useData;

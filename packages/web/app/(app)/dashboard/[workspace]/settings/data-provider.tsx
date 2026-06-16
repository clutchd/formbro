"use client";

import type { ConvexReactClient } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { api } from "@formbro/convex/_generated/api";
import { useConvex, useQuery } from "convex/react";
import {
  prewarmRoute,
  type RoutePrewarmOptions,
  useRoutePrewarm,
} from "@/lib/convex/route-prewarm";
import { createSegmentData } from "@/lib/data-segment";
import { useWorkspaceData } from "../data-provider";

const workspaceSettingsSegment = createSegmentData<{
  members: FunctionReturnType<typeof api.workspace.listMembers> | undefined;
}>("Workspace");

export async function prewarmWorkspaceSettingsRoute(
  convex: ConvexReactClient,
  workspaceSlug: string,
) {
  prewarmRoute(convex, [{ query: api.workspace.context, args: { workspaceSlug } }]);
  try {
    const context = await convex.query(api.workspace.context, { workspaceSlug });
    if (!context?.ok || !context.data.workspace._id) {
      return;
    }
    prewarmRoute(convex, [
      { query: api.workspace.listMembers, args: { workspaceId: context.data.workspace._id } },
    ]);
  } catch (error) {
    console.warn("Workspace settings dependent prewarm failed", error);
  }
}

export function useWorkspaceSettingsPrewarmIntent(
  workspaceSlug: string,
  options: RoutePrewarmOptions = {},
) {
  const convex = useConvex();
  return useRoutePrewarm(
    `/dashboard/${workspaceSlug}/settings`,
    () => prewarmWorkspaceSettingsRoute(convex, workspaceSlug),
    options,
  );
}

export function WorkspaceSettingsDataProvider({ children }: { children: ReactNode }) {
  const { workspace } = useWorkspaceData();
  const members = useQuery(
    api.workspace.listMembers,
    workspace ? { workspaceId: workspace._id } : "skip",
  );
  return (
    <workspaceSettingsSegment.Provider value={{ members }}>
      {children}
    </workspaceSettingsSegment.Provider>
  );
}

export const useWorkspaceSettingsData = workspaceSettingsSegment.useData;

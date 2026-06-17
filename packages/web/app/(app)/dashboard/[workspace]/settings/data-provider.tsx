"use client";

import type { ConvexReactClient } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { api } from "@formbro/convex/_generated/api";
import { getErrorMessage } from "@formbro/convex/errors";
import { useConvex, useQuery } from "convex/react";
import { Loading } from "@/components/loading";
import { PageState } from "@/components/page-state";
import {
  prewarmRoute,
  type RoutePrewarmOptions,
  useRoutePrewarm,
} from "@/lib/convex/route-prewarm";
import { createSegmentData } from "@/lib/data-segment";
import { useWorkspaceData } from "../data-provider";

const workspaceSettingsSegment = createSegmentData<{
  members: FunctionReturnType<typeof api.workspace.listMembers> | undefined;
  billing: FunctionReturnType<typeof api.workspace.billing> | undefined;
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
      { query: api.workspace.billing, args: { workspaceId: context.data.workspace._id } },
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
  const billing = useQuery(
    api.workspace.billing,
    workspace ? { workspaceId: workspace._id } : "skip",
  );
  const members = useQuery(
    api.workspace.listMembers,
    workspace ? { workspaceId: workspace._id } : "skip",
  );
  return (
    <workspaceSettingsSegment.Provider value={{ members, billing }}>
      {children}
    </workspaceSettingsSegment.Provider>
  );
}

export const useWorkspaceSettingsData = workspaceSettingsSegment.useData;

export function WorkspaceSettingsContentBoundary({ children }: { children: ReactNode }) {
  const { billing, members } = useWorkspaceSettingsData();

  if (billing === undefined || members === undefined) {
    return <Loading title="settings" />;
  }

  if (!billing.ok) {
    return (
      <PageState title="Billing unavailable" description={getErrorMessage(billing.error)} error />
    );
  }

  if (!members.ok) {
    return (
      <PageState title="Members unavailable" description={getErrorMessage(members.error)} error />
    );
  }

  return children;
}

export function useRequiredWorkspaceSettingsData() {
  const { billing, members } = useWorkspaceSettingsData();
  if (!billing?.ok || !members?.ok) {
    throw new Error("useRequiredWorkspaceSettingsData requires loaded settings data");
  }
  return {
    billing: billing.data,
    members: members.data,
  };
}

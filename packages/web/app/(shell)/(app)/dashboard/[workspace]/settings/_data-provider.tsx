"use client";

import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { api } from "@formbro/convex/_generated/api";
import { getErrorMessage } from "@formbro/convex/errors";
import { useConvex, useQuery } from "convex/react";
import { useMemo } from "react";
import { Loading } from "@/components/loading";
import { PageState } from "@/components/page-state";
import { type RoutePrewarmOptions, useRoutePrewarm } from "@/lib/convex/route-prewarm";
import { createSegmentData } from "@/lib/data-segment";
import { useWorkspaceData } from "../_data-provider";
import { prewarmWorkspaceSettingsRoute } from "./_prewarm";

const workspaceSettingsSegment = createSegmentData<{
  members: FunctionReturnType<typeof api.workspace.listMembers> | undefined;
  invites: FunctionReturnType<typeof api.workspace.listInvites> | undefined;
  billing: FunctionReturnType<typeof api.workspace.billing> | undefined;
}>("Workspace");

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
  const invites = useQuery(
    api.workspace.listInvites,
    workspace ? { workspaceId: workspace._id } : "skip",
  );
  const value = useMemo(() => ({ members, invites, billing }), [members, invites, billing]);
  return (
    <workspaceSettingsSegment.Provider value={value}>{children}</workspaceSettingsSegment.Provider>
  );
}

const useWorkspaceSettingsData = workspaceSettingsSegment.useData;

export function WorkspaceSettingsContentBoundary({ children }: { children: ReactNode }) {
  const { forms } = useWorkspaceData();
  const { billing, invites, members } = useWorkspaceSettingsData();

  if (
    forms === undefined ||
    billing === undefined ||
    members === undefined ||
    invites === undefined
  ) {
    return <Loading title="settings" />;
  }

  if (!billing.ok) {
    return (
      <PageState
        title="Billing unavailable"
        description={getErrorMessage(billing.error)}
        status="error"
      />
    );
  }

  if (!members.ok) {
    return (
      <PageState
        title="Members unavailable"
        description={getErrorMessage(members.error)}
        status="error"
      />
    );
  }

  if (!invites.ok) {
    return (
      <PageState
        title="Invites unavailable"
        description={getErrorMessage(invites.error)}
        status="error"
      />
    );
  }

  return children;
}

export function useRequiredWorkspaceSettingsData() {
  const { forms, workspace } = useWorkspaceData();
  const { billing, invites, members } = useWorkspaceSettingsData();
  if (!workspace || forms === undefined || !billing?.ok || !members?.ok || !invites?.ok) {
    throw new Error("useRequiredWorkspaceSettingsData requires loaded settings data");
  }

  return {
    workspace,
    forms,
    billing: billing.data,
    members: members.data,
    invites: invites.data,
  };
}

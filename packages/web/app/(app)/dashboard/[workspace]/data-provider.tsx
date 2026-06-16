"use client";

import type { ConvexReactClient } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { api } from "@formbro/convex/_generated/api";
import { RiErrorWarningLine } from "@remixicon/react";
import { useConvex, useQuery } from "convex/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loading } from "@/components/loading";
import { PageState } from "@/components/page-state";
import {
  prewarmRoute,
  useRoutePrewarm,
  type RoutePrewarmOptions,
} from "@/lib/convex/route-prewarm";
import { createSegmentData } from "@/lib/data-segment";

const workspaceSegment = createSegmentData<{
  context: FunctionReturnType<typeof api.workspace.context> | undefined;
  workspace:
    | Extract<FunctionReturnType<typeof api.workspace.context>, { ok: true }>["data"]["workspace"]
    | undefined;
  forms: Extract<FunctionReturnType<typeof api.forms.list>, { ok: true }>["data"] | undefined;
}>("Workspace");

export async function prewarmWorkspaceRoute(convex: ConvexReactClient, workspaceSlug: string) {
  prewarmRoute(convex, [{ query: api.workspace.context, args: { workspaceSlug } }]);
  try {
    const context = await convex.query(api.workspace.context, { workspaceSlug });
    if (!context?.ok || !context.data.workspace._id) {
      return;
    }
    prewarmRoute(convex, [
      { query: api.forms.list, args: { workspaceId: context.data.workspace._id } },
    ]);
  } catch (error) {
    console.warn("Workspace dependent prewarm failed", error);
  }
}

export function useWorkspacePrewarmIntent(
  workspaceSlug: string,
  options: RoutePrewarmOptions = {},
) {
  const convex = useConvex();
  return useRoutePrewarm(
    `/dashboard/${workspaceSlug}`,
    () => prewarmWorkspaceRoute(convex, workspaceSlug),
    options,
  );
}

export function WorkspaceDataProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { workspace: workspaceSlug } = useParams<{ workspace: string }>();
  const context = useQuery(api.workspace.context, { workspaceSlug });
  const contextData = context?.ok ? context.data : null;
  const workspaceData = contextData?.workspace;
  const formsResult = useQuery(
    api.forms.list,
    workspaceData ? { workspaceId: workspaceData._id } : "skip",
  );
  const forms = formsResult?.ok ? formsResult.data : undefined;

  useEffect(() => {
    if (!contextData || contextData.isCanonical || pathname === contextData.canonicalPath) {
      return;
    }

    router.replace(contextData.canonicalPath);
  }, [contextData, pathname, router]);

  return (
    <workspaceSegment.Provider value={{ context, workspace: workspaceData, forms }}>
      {children}
    </workspaceSegment.Provider>
  );
}

export function WorkspaceContentBoundary({ children }: { children: ReactNode }) {
  const { context, workspace: workspaceData } = useWorkspaceData();

  if (context === undefined) {
    return <Loading title="workspace" />;
  }

  if (!workspaceData) {
    return (
      <PageState
        icon={<RiErrorWarningLine />}
        title="Workspace unavailable"
        description="This workspace does not exist or you no longer have access."
        error
      />
    );
  }

  return children;
}

export const useWorkspaceData = workspaceSegment.useData;

export function useRequiredWorkspaceData() {
  const data = useWorkspaceData();
  if (!data.workspace) {
    throw new Error("useRequiredWorkspaceData requires a loaded workspace");
  }
  return { ...data, workspace: data.workspace };
}

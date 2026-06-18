"use client";

import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { api } from "@formbro/convex/_generated/api";
import { RiErrorWarningLine } from "@remixicon/react";
import { useConvex, useQuery } from "convex/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Loading } from "@/components/loading";
import { PageState } from "@/components/page-state";
import { useRoutePrewarm, type RoutePrewarmOptions } from "@/lib/convex/route-prewarm";
import { createSegmentData } from "@/lib/data-segment";
import { prewarmWorkspaceRoute } from "./_prewarm";

const workspaceSegment = createSegmentData<{
  context: FunctionReturnType<typeof api.workspace.context> | undefined;
  workspace:
    | Extract<FunctionReturnType<typeof api.workspace.context>, { ok: true }>["data"]["workspace"]
    | undefined;
  forms: Extract<FunctionReturnType<typeof api.forms.list>, { ok: true }>["data"] | undefined;
}>("Workspace");

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
  const value = useMemo(
    () => ({ context, workspace: workspaceData, forms }),
    [context, workspaceData, forms],
  );
  const shouldRedirect =
    contextData !== null && !contextData.isCanonical && pathname !== contextData.canonicalPath;

  if (shouldRedirect) {
    router.replace(contextData.canonicalPath);
    return <Loading title="workspace" />;
  }

  return <workspaceSegment.Provider value={value}>{children}</workspaceSegment.Provider>;
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

"use client";

import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { api } from "@formbro/convex/_generated/api";
import { RiErrorWarningLine } from "@remixicon/react";
import { useConvex, useQuery } from "convex/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect, useMemo } from "react";
import { Loading } from "@/components/loading";
import { PageState } from "@/components/page-state";
import { useRoutePrewarm, type RoutePrewarmOptions } from "@/lib/convex/route-prewarm";
import { createSegmentData } from "@/lib/data-segment";
import { prewarmWorkspaceRoute } from "./_prewarm";

type WorkspaceData = Extract<
  FunctionReturnType<typeof api.workspace.context>,
  { ok: true }
>["data"]["workspace"];

const workspaceSegment = createSegmentData<{
  context: FunctionReturnType<typeof api.workspace.context> | undefined;
  workspace: WorkspaceData | undefined;
  form:
    | Extract<FunctionReturnType<typeof api.workspace.context>, { ok: true }>["data"]["form"]
    | undefined;
  forms: Extract<FunctionReturnType<typeof api.forms.list>, { ok: true }>["data"] | undefined;
  metrics:
    | Extract<FunctionReturnType<typeof api.workspace.metrics>, { ok: true }>["data"]
    | undefined;
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

function WorkspaceAnalyticsGroup({ workspace }: { workspace: WorkspaceData }) {
  const posthog = usePostHog();
  const { _id, billingStatus, name, plan, slug } = workspace;

  useEffect(() => {
    posthog.group("workspace", _id, {
      billing_status: billingStatus ?? "inactive",
      name,
      plan: plan ?? "free",
      slug,
    });

    return () => {
      posthog.resetGroups();
    };
  }, [posthog, _id, billingStatus, name, plan, slug]);

  return null;
}

export function WorkspaceDataProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { workspace: workspaceSlug, form: formSlug } = useParams<{
    workspace: string;
    form?: string;
  }>();
  const contextArgs = useMemo(
    () => (formSlug ? { workspaceSlug, formSlug } : { workspaceSlug }),
    [workspaceSlug, formSlug],
  );
  const context = useQuery(api.workspace.context, contextArgs);
  const contextData = context?.ok ? context.data : null;
  const workspaceData = contextData?.workspace;
  const formData = contextData?.form;
  const formsResult = useQuery(
    api.forms.list,
    workspaceData ? { workspaceId: workspaceData._id } : "skip",
  );
  const metricsResult = useQuery(
    api.workspace.metrics,
    workspaceData ? { workspaceId: workspaceData._id } : "skip",
  );
  const forms = formsResult?.ok ? formsResult.data : undefined;
  const metrics = metricsResult?.ok ? metricsResult.data : undefined;
  const value = useMemo(
    () => ({ context, workspace: workspaceData, form: formData, forms, metrics }),
    [context, workspaceData, formData, forms, metrics],
  );
  const shouldRedirect =
    contextData !== null && !contextData.isCanonical && pathname !== contextData.canonicalPath;

  if (shouldRedirect) {
    router.replace(contextData.canonicalPath);
    return <Loading title="workspace" />;
  }

  return (
    <workspaceSegment.Provider value={value}>
      {workspaceData ? <WorkspaceAnalyticsGroup workspace={workspaceData} /> : null}
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
        status="error"
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

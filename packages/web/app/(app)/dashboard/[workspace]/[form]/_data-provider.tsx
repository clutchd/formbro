"use client";

import type { FunctionReturnType } from "convex/server";
import type { ReactNode } from "react";
import { api } from "@formbro/convex/_generated/api";
import { getErrorMessage } from "@formbro/convex/errors";
import { useConvex, useQuery } from "convex/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Loading } from "@/components/loading";
import { PageState } from "@/components/page-state";
import { type RoutePrewarmOptions, useRoutePrewarm } from "@/lib/convex/route-prewarm";
import { createSegmentData } from "@/lib/data-segment";
import { prewarmWorkspaceFormRoute } from "./_prewarm";

type WorkspaceContext = FunctionReturnType<typeof api.workspace.context>;
type LoadedWorkspaceContext = Extract<WorkspaceContext, { ok: true }>["data"];

const workspaceFormSegment = createSegmentData<{
  context: WorkspaceContext | undefined;
  workspace: LoadedWorkspaceContext["workspace"] | undefined;
  form: LoadedWorkspaceContext["form"] | undefined;
}>("WorkspaceForm");

export function useWorkspaceFormPrewarmIntent(
  workspaceSlug: string,
  formSlug: string,
  options: RoutePrewarmOptions = {},
) {
  const convex = useConvex();
  return useRoutePrewarm(
    `/dashboard/${workspaceSlug}/${formSlug}`,
    () => prewarmWorkspaceFormRoute(convex, workspaceSlug, formSlug),
    options,
  );
}

export function WorkspaceFormDataProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { workspace: workspaceSlug, form: formSlug } = useParams<{
    workspace: string;
    form: string;
  }>();
  const context = useQuery(api.workspace.context, { workspaceSlug, formSlug });
  const contextData = context?.ok ? context.data : null;
  const workspace = contextData?.workspace;
  const form = contextData?.form;
  const shouldRedirect =
    contextData !== null && !contextData.isCanonical && pathname !== contextData.canonicalPath;

  const value = useMemo(() => ({ context, workspace, form }), [context, workspace, form]);

  if (shouldRedirect) {
    router.replace(contextData.canonicalPath);
    return <Loading title="form" />;
  }

  return <workspaceFormSegment.Provider value={value}>{children}</workspaceFormSegment.Provider>;
}

export const useWorkspaceFormData = workspaceFormSegment.useData;

export function WorkspaceFormContentBoundary({ children }: { children: ReactNode }) {
  const { context, form } = useWorkspaceFormData();

  if (context === undefined) {
    return <Loading title="form" />;
  }

  if (!context.ok) {
    return (
      <PageState title="Form unavailable" description={getErrorMessage(context.error)} error />
    );
  }

  if (!form) {
    return (
      <PageState
        title="Form unavailable"
        description="This form does not exist or you no longer have access."
        error
      />
    );
  }

  return children;
}

export function useRequiredWorkspaceFormData() {
  const { context } = useWorkspaceFormData();
  if (!context?.ok || !context.data.form) {
    throw new Error("useRequiredWorkspaceFormData requires loaded form data");
  }

  return {
    context: context.data,
    workspace: context.data.workspace,
    form: context.data.form,
  };
}

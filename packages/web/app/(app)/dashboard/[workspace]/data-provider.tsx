"use client";

import { api } from "@formbro/convex/_generated/api";
import { RiErrorWarningLine } from "@remixicon/react";
import { useQuery, type ConvexReactClient } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { Loading } from "@/components/loading";
import { PageState } from "@/components/page-state";
import { makeRouteQuerySpec, prewarmSpecs } from "@/lib/convex/route-data";

type WorkspaceRouteContextResult = Awaited<
  ReturnType<typeof useQuery<typeof api.workspace.context>>
>;
type WorkspaceRouteContext = Extract<
  NonNullable<WorkspaceRouteContextResult>,
  { ok: true }
>["data"];
type FormsResult = Awaited<ReturnType<typeof useQuery<typeof api.forms.list>>>;
type Forms = Extract<NonNullable<FormsResult>, { ok: true }>["data"];
type WorkspaceDataContextValue = {
  context: WorkspaceRouteContext | null | undefined;
  workspace: WorkspaceRouteContext["workspace"] | undefined;
  forms: Forms | undefined;
};

const WorkspaceDataContext = createContext<WorkspaceDataContextValue | null>(null);

export async function prewarmWorkspace(
  convex: ConvexReactClient,
  params: {
    workspaceSlug: string;
  },
) {
  prewarmSpecs(convex, [
    makeRouteQuerySpec(api.workspace.context, {
      workspaceSlug: params.workspaceSlug,
    }),
  ]);

  try {
    const context = await convex.query(api.workspace.context, {
      workspaceSlug: params.workspaceSlug,
    });

    if (!context?.ok || !context.data.workspace._id) {
      return;
    }

    prewarmSpecs(convex, [
      makeRouteQuerySpec(api.forms.list, {
        workspaceId: context.data.workspace._id,
      }),
    ]);
  } catch (error) {
    console.warn("Workspace dependent prewarm failed", error);
  }
}

export function WorkspaceDataProvider({
  workspaceSlug,
  children,
}: {
  workspaceSlug: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const contextResult = useQuery(api.workspace.context, {
    workspaceSlug,
  });
  const context =
    contextResult === undefined ? undefined : contextResult.ok ? contextResult.data : null;
  const workspace = context?.workspace;
  const formsResult = useQuery(api.forms.list, workspace ? { workspaceId: workspace._id } : "skip");
  const forms = formsResult?.ok ? formsResult.data : undefined;

  useEffect(() => {
    if (!context || context.isCanonical || pathname === context.canonicalPath) {
      return;
    }

    router.replace(context.canonicalPath);
  }, [context, pathname, router]);

  return (
    <WorkspaceDataContext.Provider value={{ context, workspace, forms }}>
      {children}
    </WorkspaceDataContext.Provider>
  );
}

export function WorkspaceContentBoundary({ children }: { children: ReactNode }) {
  const { context, workspace } = useWorkspaceData();

  if (context === undefined) {
    return <Loading title="workspace" />;
  }

  if (!workspace) {
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

export function useWorkspaceData() {
  const value = useContext(WorkspaceDataContext);

  if (!value) {
    throw new Error("useWorkspaceData must be used within WorkspaceDataProvider");
  }

  return value;
}

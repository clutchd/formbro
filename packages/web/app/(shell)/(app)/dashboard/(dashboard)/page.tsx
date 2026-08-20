"use client";

import type { Id } from "@formbro/convex/_generated/dataModel";
import { api } from "@formbro/convex/_generated/api";
import { hasWorkspacePlanAccess } from "@formbro/convex/billingUtils";
import { getErrorMessage } from "@formbro/convex/errors";
import { TypographyH1, TypographySubheading } from "@formbro/ui/typography";
import { RiTeamLine } from "@remixicon/react";
import { useConvex, useMutation } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Loading } from "@/components/loading";
import { Page } from "@/components/page";
import { PageState } from "@/components/page-state";
import { getTemplate, templateIdFromSlug } from "@/templates";
import { formCreateFromTemplateArgs } from "@/templates/create-from-template";
import { prewarmWorkspaceFormRoute } from "../[workspace]/[form]/_prewarm";
import { useDashboardData } from "./_data-provider";
import { CreateWorkspace } from "./create-workspace-form";
import { WorkspaceCard } from "./workspace-card";

export default function DashboardContent() {
  return (
    <Suspense fallback={<Loading title="workspaces" />}>
      <DashboardContentInner />
    </Suspense>
  );
}

function DashboardContentInner() {
  const router = useRouter();
  const convex = useConvex();
  const searchParams = useSearchParams();
  const templateSlug = searchParams.get("template");
  const { workspaces } = useDashboardData();
  const createForm = useMutation(api.forms.create);
  const started = useRef(false);

  async function createFromTemplate(
    workspace: { _id: Id<"workspaces">; slug: string },
    slug: string,
  ) {
    const template = getTemplate(templateIdFromSlug(slug));
    if (!template) {
      toast.error("That template is no longer available.");
      router.replace("/dashboard");
      return;
    }

    const result = await createForm(
      formCreateFromTemplateArgs({
        workspaceId: workspace._id,
        name: template.name,
        templateId: template.id,
        templateVersion: template.version,
        schema: template.schema,
      }),
    );

    if (!result?.ok) {
      toast.error("Could not create form", { description: getErrorMessage(result?.error) });
      return;
    }

    const href = `/dashboard/${workspace.slug}/${result.data.slug}`;
    router.prefetch(href);
    await prewarmWorkspaceFormRoute(convex, workspace.slug, result.data.slug);
    router.push(href);
  }

  useEffect(() => {
    if (!templateSlug || !workspaces?.ok || started.current || workspaces.data.length === 0) {
      return;
    }

    const workspace =
      workspaces.data.find((item) => hasWorkspacePlanAccess(item)) ?? workspaces.data[0];
    if (!workspace) return;

    started.current = true;

    if (!hasWorkspacePlanAccess(workspace)) {
      toast.error("Upgrade this workspace to create a form.");
      router.push(`/dashboard/${workspace.slug}/settings`);
      return;
    }

    void createFromTemplate(workspace, templateSlug);
  }, [createForm, convex, router, templateSlug, workspaces]);

  if (!workspaces?.ok) {
    return <Loading title="workspaces" />;
  }

  if (workspaces.data.length === 0) {
    return (
      <PageState
        icon={<RiTeamLine />}
        title="No workspaces yet"
        description={
          templateSlug
            ? "Create a workspace to save this template as a form."
            : "Create your first workspace to get started"
        }
      >
        <CreateWorkspace
          onCreated={async (workspace) => {
            if (!templateSlug) {
              router.push(`/dashboard/${workspace.slug}`);
              return;
            }
            await createFromTemplate(
              { _id: workspace.workspaceId, slug: workspace.slug },
              templateSlug,
            );
          }}
        />
      </PageState>
    );
  }

  if (templateSlug) {
    return <Loading title="form" />;
  }

  return (
    <Page>
      <div className="mb-6">
        <TypographyH1>All Workspaces</TypographyH1>
        <TypographySubheading>
          {workspaces.data.length} workspace{workspaces.data.length === 1 ? "" : "s"}
        </TypographySubheading>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces.data.map((workspace) => (
          <WorkspaceCard key={workspace._id} workspace={workspace} />
        ))}
      </div>
    </Page>
  );
}

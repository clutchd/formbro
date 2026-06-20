"use client";

import { useParams } from "next/navigation";
import { DashboardHeader } from "../../header";
import { useWorkspaceData, useWorkspacePrewarmIntent } from "../_data-provider";
import { useWorkspaceFormData, useWorkspaceFormPrewarmIntent } from "./_data-provider";

export function WorkspaceFormHeader() {
  const { workspace: workspaceSlug, form: formSlug } = useParams<{
    workspace: string;
    form: string;
  }>();
  const { workspace } = useWorkspaceData();
  const { form } = useWorkspaceFormData();
  const workspacePrewarm = useWorkspacePrewarmIntent(workspaceSlug);
  const formPrewarm = useWorkspaceFormPrewarmIntent(workspaceSlug, formSlug);

  return (
    <DashboardHeader
      breadcrumbs={
        workspace
          ? [
              {
                href: `/dashboard/${workspace.slug}`,
                label: workspace.name,
                prewarm: workspacePrewarm,
              },
              ...(form
                ? [
                    {
                      href: `/dashboard/${workspace.slug}/${form.slug}`,
                      label: form.name,
                      prewarm: formPrewarm,
                    },
                  ]
                : []),
            ]
          : []
      }
    />
  );
}

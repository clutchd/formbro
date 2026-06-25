"use client";

import type { Doc } from "@formbro/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { DashboardHeader } from "../../header";
import { useWorkspaceData, useWorkspacePrewarmIntent } from "../_data-provider";
import { useWorkspaceFormData, useWorkspaceFormPrewarmIntent } from "./_data-provider";
import { FormStatusBadge } from "./form-status-badge";

function FormBreadcrumbLabel({ form }: { form: Doc<"forms"> }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="truncate">{form.name}</span>
      <FormStatusBadge status={form.status} />
    </span>
  );
}

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
                      label: <FormBreadcrumbLabel form={form} />,
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

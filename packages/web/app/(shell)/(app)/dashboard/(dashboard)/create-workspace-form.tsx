"use client";

import { api } from "@formbro/convex/_generated/api";
import { CREATE_WORKSPACE } from "@formbro/convex/system/forms/create_workspace";
import { RiAddLine } from "@remixicon/react";
import { useConvex, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import * as React from "react";
import { InternalDialogForm } from "@/components/internal-dialog-form";
import { prewarmWorkspaceRoute } from "../[workspace]/_prewarm";

export function CreateWorkspace({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const posthog = usePostHog();
  const convex = useConvex();
  const createWorkspace = useMutation(api.workspace.create);

  return (
    <InternalDialogForm
      title="Create Workspace"
      description="Create a new workspace to start creating forms."
      schema={CREATE_WORKSPACE.typed}
      action={async ({ values }) => {
        const workspace = await createWorkspace({
          name: values.name ?? "",
        });

        if (workspace?.ok) {
          const href = `/dashboard/${workspace.data.slug}`;
          router.prefetch(href);
          await prewarmWorkspaceRoute(convex, workspace.data.slug);
        }

        return workspace;
      }}
      onSuccess={({ data }) => {
        posthog.capture("workspace_created", {
          $groups: { workspace: data.workspaceId },
          workspace_id: data.workspaceId,
          workspace_slug: data.slug,
        });
        router.push(`/dashboard/${data.slug}`);
      }}
      Icon={RiAddLine}
    >
      {children}
    </InternalDialogForm>
  );
}

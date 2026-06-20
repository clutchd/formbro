"use client";

import { api } from "@formbro/convex/_generated/api";
import { CREATE_FORM } from "@formbro/convex/system/forms/create_form";
import { RiAddLine } from "@remixicon/react";
import { useConvex, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { InternalDialogForm } from "@/components/internal-dialog-form";
import { prewarmWorkspaceFormRoute } from "./[form]/_prewarm";
import { useRequiredWorkspaceData } from "./_data-provider";

export function CreateForm({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const { workspace } = useRequiredWorkspaceData();
  const convex = useConvex();
  const createForm = useMutation(api.forms.create);

  return (
    <InternalDialogForm
      title="Create Form"
      description="Create a new form in this workspace."
      schema={CREATE_FORM.typed}
      Icon={RiAddLine}
      action={async ({ values }) => {
        const form = await createForm({
          workspaceId: workspace._id,
          name: values.name ?? "",
        });

        if (form?.ok) {
          const href = `/dashboard/${workspace.slug}/${form.data.slug}`;
          router.prefetch(href);
          await prewarmWorkspaceFormRoute(convex, workspace.slug, form.data.slug);
        }

        return form;
      }}
      onSuccess={({ data }) => {
        router.push(`/dashboard/${workspace.slug}/${data.slug}`);
      }}
    >
      {children}
    </InternalDialogForm>
  );
}

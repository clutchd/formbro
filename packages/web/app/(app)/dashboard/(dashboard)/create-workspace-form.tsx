"use client";

import { api } from "@formbro/convex/_generated/api";
import { CREATE_WORKSPACE } from "@formbro/convex/system/forms/create_workspace";
import { RiAddLine } from "@remixicon/react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { InternalDialogForm } from "@/components/internal-dialog-form";

export function CreateWorkspace({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const createWorkspace = useMutation(api.workspace.create);

  return (
    <InternalDialogForm
      title="Create Workspace"
      description="Create a new workspace to start creating forms."
      schema={CREATE_WORKSPACE.typed}
      action={async ({ values }) => {
        return await createWorkspace({
          name: values.name ?? "",
        });
      }}
      onSuccess={({ data }) => {
        router.push(`/dashboard/${data.slug}`);
      }}
      Icon={RiAddLine}
    >
      {children}
    </InternalDialogForm>
  );
}

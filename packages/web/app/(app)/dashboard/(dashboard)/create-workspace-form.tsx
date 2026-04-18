"use client";

import { api } from "@formbro/convex/_generated/api";
import { CREATE_WORKSPACE } from "@formbro/convex/system/forms/create_workspace";
import { Form } from "@formbro/react/components/form";
import { Button } from "@formbro/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@formbro/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { RiAddLine } from "@remixicon/react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import * as React from "react";

export function CreateWorkspace({
  children = (
    <Button>
      <RiAddLine className="size-4" />
      Create Workspace
    </Button>
  ),
  open,
  onOpenChange,
}: {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();

  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open ?? internalOpen;
  const handleOpenChange = onOpenChange ?? setInternalOpen;

  const createWorkspace = useMutation(api.workspace.create);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>Create a new workspace to start creating forms.</DialogDescription>
        </DialogHeader>
        <Form
          schema={CREATE_WORKSPACE.typed}
          action={async ({ values }) => {
            const createdWorkspace = await createWorkspace({
              name: values.name ?? "",
            });
            return createdWorkspace;
          }}
          onSuccess={({ data }) => {
            handleOpenChange(false);
            router.push(`/dashboard/${data.slug}`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

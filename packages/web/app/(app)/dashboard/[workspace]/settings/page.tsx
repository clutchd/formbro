"use client";

import { api } from "@formbro/convex/_generated/api";
import { getErrorMessage } from "@formbro/convex/errors";
import { Button } from "@formbro/ui/button";
import { Card } from "@formbro/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@formbro/ui/dialog";
import { Spinner } from "@formbro/ui/spinner";
import { TypographyP, TypographySubheading } from "@formbro/ui/typography";
import { RiDeleteBinLine } from "@remixicon/react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Page } from "@/components/page";
import { useRequiredWorkspaceData } from "../data-provider";
import { BillingLimits } from "./billing-limits";
import { useRequiredWorkspaceSettingsData } from "./data-provider";
import { ManageBilling } from "./manage-billing";
import { MembersPanel } from "./members-panel";
import { PlansPanel } from "./plans-panel";

export default function BillingSettingsPage() {
  const router = useRouter();
  const { workspace } = useRequiredWorkspaceData();
  const { billing } = useRequiredWorkspaceSettingsData();
  const deleteWorkspace = useMutation(api.workspace.deleteWorkspace);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteWorkspace = useCallback(async () => {
    setIsDeleting(true);
    const result = await deleteWorkspace({ workspaceId: billing.workspaceId });
    if (!result.ok) {
      setIsDeleting(false);
      toast.error("Failed to delete workspace. Please try again.", {
        description: getErrorMessage(result.error),
      });
      return;
    }
    setIsDeleting(false);
    setConfirmOpen(false);
    toast.success("Workspace deleted successfully");
    router.push(`/dashboard`);
  }, [deleteWorkspace, billing.workspaceId, router]);

  return (
    <Page className="space-y-5">
      <ManageBilling />
      {billing.hasActiveSubscription ? <BillingLimits /> : null}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3 lg:gap-4">
        <PlansPanel />
        <MembersPanel />
      </div>
      {billing.canManageBilling ? (
        <Card className="border-destructive/20">
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="flex flex-col">
              <TypographySubheading className="text-foreground">
                Delete Workspace
              </TypographySubheading>
              <TypographyP className="text-sm">
                Permanently delete this workspace, all forms, and submissions.
              </TypographyP>
            </div>
            <Dialog
              open={confirmOpen}
              onOpenChange={(open) => {
                if (!isDeleting) {
                  setConfirmOpen(open);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <RiDeleteBinLine className="size-4" />
                  Delete Workspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete workspace?</DialogTitle>
                  <DialogDescription>
                    This permanently deletes <strong>{workspace.name}</strong>, all of its forms,
                    and every submission. This cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" disabled={isDeleting}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={() => void handleDeleteWorkspace()}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Spinner /> : null}
                    Delete Workspace
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      ) : null}
    </Page>
  );
}

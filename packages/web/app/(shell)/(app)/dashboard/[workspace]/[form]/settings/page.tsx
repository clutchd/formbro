"use client";

import { api } from "@formbro/convex/_generated/api";
import { getErrorMessage } from "@formbro/convex/errors";
import { twx } from "@formbro/shared/twx";
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
import { Switch } from "@formbro/ui/switch";
import { TypographyH2, TypographyP, TypographySubheading } from "@formbro/ui/typography";
import { RiDeleteBinLine } from "@remixicon/react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Page } from "@/components/page";
import { useRequiredWorkspaceFormData } from "../_data-provider";

function SettingsSection({
  children,
  className,
  description,
  title,
}: {
  children: ReactNode;
  className?: string;
  description?: string;
  title: string;
}) {
  return (
    <section className={twx("flex flex-col", className)}>
      <div className="pb-4">
        <TypographyH2>{title}</TypographyH2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="divide-y border-y">{children}</div>
    </section>
  );
}

function SettingsItem({
  action,
  badge,
  className,
  description,
  disabled,
  title,
}: {
  action?: ReactNode;
  badge?: ReactNode;
  className?: string;
  description?: string;
  disabled?: boolean;
  title: string;
}) {
  return (
    <div
      className={twx(
        "flex items-center justify-between gap-6 py-5",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{title}</p>
          {badge}
        </div>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
    </div>
  );
}

function FormMetric({
  className,
  description,
  label,
  value,
}: {
  className?: string;
  description?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={twx("border bg-background p-4", className)}>
      <TypographySubheading className="text-muted-foreground">{label}</TypographySubheading>
      <p className="mt-2 truncate font-display text-xl font-bold tracking-tight">{value}</p>
      {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function FormSettingsPage() {
  const router = useRouter();
  const { form, workspace } = useRequiredWorkspaceFormData();
  const updateFormStatus = useMutation(api.forms.updateStatus);
  const deleteForm = useMutation(api.forms.deleteForm);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingClosed, setPendingClosed] = useState<boolean | null>(null);

  useEffect(() => {
    setPendingClosed(null);
  }, [form.status]);

  const isClosed = pendingClosed ?? form.status === "closed";

  const handleDeleteForm = useCallback(async () => {
    setIsDeleting(true);
    const result = await deleteForm({ formId: form._id });
    if (!result.ok) {
      setIsDeleting(false);
      toast.error("Failed to delete form. Please try again.", {
        description: getErrorMessage(result.error),
      });
      return;
    }
    setIsDeleting(false);
    setConfirmOpen(false);
    toast.success("Form deleted successfully");
    router.push(`/dashboard/${workspace.slug}`);
  }, [deleteForm, form._id, router, workspace.slug]);

  const handleCloseFormChange = useCallback(
    (checked: boolean) => {
      const status = checked ? "closed" : "open";
      setPendingClosed(checked);
      void updateFormStatus({ formId: form._id, status }).then((result) => {
        if (!result.ok) {
          setPendingClosed(null);
          toast.error("Failed to update form status.", {
            description: getErrorMessage(result.error),
          });
        }
      });
    },
    [updateFormStatus, form._id],
  );

  return (
    <Page className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormMetric label="Status" className="capitalize" value={form.status} />
        <FormMetric label="Created" value={formatDate(form._creationTime)} />
      </div>

      <SettingsSection title="Access Controls">
        <SettingsItem
          title="Close form"
          description="Stop accepting new submissions while keeping the form visible."
          action={<Switch checked={isClosed} onCheckedChange={handleCloseFormChange} />}
        />
      </SettingsSection>

      <Card className="border-destructive/20">
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="flex flex-col">
            <TypographySubheading className="text-foreground">Delete Form</TypographySubheading>
            <TypographyP className="text-foreground-muted text-sm">
              Permanently delete this form, all its schemas, and every submission. This cannot be
              undone.
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
                Delete Form
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete form?</DialogTitle>
                <DialogDescription>
                  This permanently deletes <strong>{form.name}</strong>, all of its schemas, and
                  every submission. This cannot be undone.
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
                  onClick={() => void handleDeleteForm()}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Spinner /> : null}
                  Delete Form
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </Page>
  );
}

"use client";

import type { Id } from "@formbro/convex/_generated/dataModel";
import type { FormInput } from "@formbro/core/schema/form";
import { api } from "@formbro/convex/_generated/api";
import { hasWorkspacePlanAccess } from "@formbro/convex/billingUtils";
import { getErrorMessage } from "@formbro/convex/errors";
import { Form } from "@formbro/react/components/form";
import { Button } from "@formbro/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@formbro/ui/dialog";
import { RiArrowRightLine } from "@remixicon/react";
import { useAppData } from "app/_data-provider";
import { useConvex, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authHref } from "@/lib/auth/callback-url";
import { formCreateFromTemplateArgs } from "@/templates/create-from-template";
import { prewarmWorkspaceFormRoute } from "../../(app)/dashboard/[workspace]/[form]/_prewarm";

function templateUsePath(templateId: string) {
  return `/templates/${templateId.replaceAll("_", "-")}`;
}

export function TemplatePreview({ schema }: { schema: FormInput }) {
  return <Form schema={schema} preview />;
}

type TemplateUseCtaProps = {
  templateId: string;
  templateVersion: number;
  name: string;
  schema: FormInput;
  autoUse?: boolean;
};

export function TemplateUseCta({
  templateId,
  templateVersion,
  name,
  schema,
  autoUse = false,
}: TemplateUseCtaProps) {
  const router = useRouter();
  const convex = useConvex();
  const { authUser } = useAppData();
  const isAuthenticated = Boolean(authUser?.ok && authUser.data);
  const workspaces = useQuery(api.workspace.list, isAuthenticated ? {} : "skip");
  const createForm = useMutation(api.forms.create);
  const [creating, setCreating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const autoStarted = useRef(false);

  const eligible =
    workspaces?.ok === true
      ? workspaces.data.filter((workspace) => hasWorkspacePlanAccess(workspace))
      : [];

  async function createInWorkspace(workspace: { _id: Id<"workspaces">; slug: string }) {
    setCreating(true);
    try {
      const result = await createForm(
        formCreateFromTemplateArgs({
          workspaceId: workspace._id,
          name,
          templateId,
          templateVersion,
          schema,
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
    } catch (error) {
      toast.error("Could not create form", { description: getErrorMessage(error) });
    } finally {
      setCreating(false);
    }
  }

  function start() {
    if (!isAuthenticated) {
      router.push(authHref("/sign-up", `${templateUsePath(templateId)}?use=1`));
      return;
    }

    if (workspaces === undefined) return;

    if (!workspaces.ok) {
      toast.error("Could not load workspaces", { description: getErrorMessage(workspaces.error) });
      return;
    }

    if (workspaces.data.length === 0) {
      router.push(`/dashboard?template=${templateId.replaceAll("_", "-")}`);
      return;
    }

    if (eligible.length === 0) {
      const workspace = workspaces.data[0];
      if (!workspace) return;
      toast.error("Upgrade this workspace to create a form.");
      router.push(`/dashboard/${workspace.slug}/settings`);
      return;
    }

    if (eligible.length === 1) {
      const workspace = eligible[0];
      if (!workspace) return;
      void createInWorkspace(workspace);
      return;
    }

    setPickerOpen(true);
  }

  const startRef = useRef(start);
  startRef.current = start;

  useEffect(() => {
    if (!autoUse || autoStarted.current || !isAuthenticated || workspaces === undefined) {
      return;
    }
    autoStarted.current = true;
    startRef.current();
  }, [autoUse, isAuthenticated, workspaces]);

  if (!isAuthenticated) {
    return (
      <Button asChild size="lg">
        <Link href={authHref("/sign-up", `${templateUsePath(templateId)}?use=1`)}>
          Use this form <RiArrowRightLine className="size-4" />
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Button size="lg" onClick={start} disabled={creating || workspaces === undefined}>
        {creating ? "Creating…" : "Use this form"}
        <RiArrowRightLine className="size-4" />
      </Button>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose a workspace</DialogTitle>
            <DialogDescription>
              {name} will be created as a draft you can edit before publishing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {eligible.map((workspace) => (
              <Button
                key={workspace._id}
                variant="outline"
                className="justify-between"
                disabled={creating}
                onClick={() => {
                  setPickerOpen(false);
                  void createInWorkspace(workspace);
                }}
              >
                <span className="truncate">{workspace.name}</span>
                <RiArrowRightLine className="size-4" />
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

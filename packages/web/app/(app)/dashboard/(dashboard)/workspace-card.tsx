"use client";

import type { FunctionReturnType } from "convex/server";
import { api } from "@formbro/convex/_generated/api";
import { getWorkspaceBillingState, getWorkspacePlanLabel } from "@formbro/convex/lib";
import { twx } from "@formbro/shared/twx";
import { Badge } from "@formbro/ui/badge";
import { Button } from "@formbro/ui/button";
import { Card } from "@formbro/ui/card";
import { tuiFont } from "@formbro/ui/typography";
import { RiArrowRightLine, RiFileAddLine, RiFileTextLine } from "@remixicon/react";
import Link from "next/link";
import { useWorkspacePrewarmIntent } from "../[workspace]/data-provider";
import { WorkspaceBillingStateBadge } from "../workspace-billing-state-badge";

type Workspace = Extract<
  FunctionReturnType<typeof api.workspace.list>,
  { ok: true }
>["data"][number];

const isUnpaid = (workspace: Workspace) =>
  getWorkspaceBillingState(workspace.billingStatus) != "success";

function FormStatusBadge({ status }: { status: Workspace["forms"][number]["status"] }) {
  let badgeStatus: "neutral" | "success" | "error" = "neutral";
  switch (status) {
    case "open":
      badgeStatus = "success";
      break;
    case "closed":
      badgeStatus = "error";
      break;
  }

  return (
    <Badge
      variant="outline"
      status={badgeStatus}
      className="px-1.5 py-0 text-[10px] leading-4 tracking-normal uppercase"
    >
      {status}
    </Badge>
  );
}

function EmptyWorkspaceContent() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-8 text-center">
      <div className="flex size-9 items-center justify-center border border-dashed">
        <RiFileAddLine className="size-4 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className={twx(tuiFont, "text-xs font-medium")}>No forms yet</p>
        <p className="text-xs text-muted-foreground">Create your first form to get started</p>
      </div>
    </div>
  );
}

function WorkspaceFormPreview({
  workspaceSlug,
  forms,
}: {
  workspaceSlug: string;
  forms: Workspace["forms"];
}) {
  if (forms.length === 0) {
    return <EmptyWorkspaceContent />;
  }

  const overflowCount = forms.length - forms.slice(0, 3).length;

  return (
    <div className="flex flex-1 flex-col">
      {forms.slice(0, 3).map((form) => (
        <Link
          key={form._id}
          href={`/dashboard/${workspaceSlug}/${form.slug}`}
          prefetch={false}
          className="group/row flex items-center gap-3 border-b px-5 py-3 transition-colors last:border-b-0 hover:bg-accent"
        >
          <div className="flex size-7 shrink-0 items-center justify-center border">
            <RiFileTextLine className="size-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium group-hover/row:text-foreground">
              {form.name}
            </p>
          </div>
          <FormStatusBadge status={form.status} />
        </Link>
      ))}
      {overflowCount > 0 ? (
        <p className={twx(tuiFont, "mt-auto px-5 py-3 text-[10px] text-muted-foreground")}>
          +{overflowCount} more
        </p>
      ) : null}
    </div>
  );
}

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const href = isUnpaid(workspace)
    ? `/dashboard/${workspace.slug}/settings`
    : `/dashboard/${workspace.slug}`;
  const prewarmIntentHandlers = useWorkspacePrewarmIntent(workspace.slug);

  return (
    <Card
      className="flex h-full flex-col gap-0 p-0"
      onMouseEnter={prewarmIntentHandlers.onMouseEnter}
      onMouseLeave={prewarmIntentHandlers.onMouseLeave}
    >
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <h3 className="truncate font-semibold">{workspace.name}</h3>
        <WorkspaceBillingStateBadge workspace={workspace} className="ml-auto shrink-0">
          {getWorkspacePlanLabel(workspace.plan)}
        </WorkspaceBillingStateBadge>
      </div>

      <div className="flex min-h-36 flex-1 flex-col">
        <WorkspaceFormPreview workspaceSlug={workspace.slug} forms={workspace.forms} />
      </div>

      <Button asChild size="lg" className="group/button mt-auto shrink-0 rounded-t-none">
        <Link
          href={href}
          prefetch={false}
          onFocus={prewarmIntentHandlers.onFocus}
          onBlur={prewarmIntentHandlers.onBlur}
          onTouchStart={prewarmIntentHandlers.onTouchStart}
        >
          {isUnpaid(workspace) ? "Manage Billing" : "Open Workspace"}
          <RiArrowRightLine className="size-3 transition-transform group-hover/button:translate-x-1" />
        </Link>
      </Button>
    </Card>
  );
}

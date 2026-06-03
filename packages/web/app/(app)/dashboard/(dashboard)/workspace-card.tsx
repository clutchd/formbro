"use client";

import { twx } from "@formbro/shared/twx";
import { Badge } from "@formbro/ui/badge";
import { Button } from "@formbro/ui/button";
import { Card } from "@formbro/ui/card";
import { tuiFont } from "@formbro/ui/typography";
import { RiArrowRightLine, RiFileAddLine, RiFileTextLine } from "@remixicon/react";
import { useConvex } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRoutePrewarmIntent } from "@/lib/convex/use-route-prewarm-intent";
import type { useDashboardData } from "./data-provider";
import { prewarmWorkspace } from "../[workspace]/data-provider";

type Workspace = ReturnType<typeof useDashboardData>["workspaces"][number];

function EmptyWorkspaceContent() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
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

function FormPreviewRow({ name, updatedLabel }: { name: string; updatedLabel: string }) {
  return (
    <div className="flex items-center gap-3 border-b px-3 py-2.5 last:border-b-0 hover:bg-accent">
      <div className="flex size-7 shrink-0 items-center justify-center border">
        <RiFileTextLine className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
      </div>
      <span className={twx(tuiFont, "shrink-0 text-[10px] text-muted-foreground")}>
        {updatedLabel}
      </span>
    </div>
  );
}

export function WorkspacePlanBadge({ workspace }: { workspace: Workspace }) {
  const isFreeWorkspace = workspace.billingStatus === "not_subscribed" || !workspace.plan;

  return (
    <Badge
      variant="outline"
      status={isFreeWorkspace ? "warning" : "success"}
      className="ml-auto uppercase"
    >
      {isFreeWorkspace ? "unpaid" : workspace.plan}
    </Badge>
  );
}

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const convex = useConvex();
  const router = useRouter();
  const forms: { name: string; updatedLabel: string }[] = [];
  const href = `/dashboard/${workspace.slug}`;
  const prewarmIntentHandlers = useRoutePrewarmIntent(() => {
    router.prefetch(href);
    prewarmWorkspace(convex, {
      workspaceSlug: workspace.slug,
    });
  });

  return (
    <Card
      className="gap-0 p-0"
      onMouseEnter={prewarmIntentHandlers.onMouseEnter}
      onMouseLeave={prewarmIntentHandlers.onMouseLeave}
    >
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <h3 className="font-semibold">{workspace.name}</h3>
        <WorkspacePlanBadge workspace={workspace} />
      </div>

      <div className="px-5">
        {forms.length === 0 ? (
          <EmptyWorkspaceContent />
        ) : (
          <div className="flex flex-col">
            {forms.map((form) => (
              <FormPreviewRow key={form.name} name={form.name} updatedLabel={form.updatedLabel} />
            ))}
          </div>
        )}
      </div>

      <Button asChild size="lg" className="group/button rounded-t-none">
        <Link
          href={href}
          prefetch={false}
          onFocus={prewarmIntentHandlers.onFocus}
          onBlur={prewarmIntentHandlers.onBlur}
          onTouchStart={prewarmIntentHandlers.onTouchStart}
        >
          Open Workspace
          <RiArrowRightLine className="size-3 transition-transform group-hover/button:translate-x-1" />
        </Link>
      </Button>
    </Card>
  );
}

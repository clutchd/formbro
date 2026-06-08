import { getBillingPaymentStatus } from "@formbro/convex/lib";
import { twx } from "@formbro/shared/twx";
import { Badge } from "@formbro/ui/badge";
import type { Workspace } from "./(dashboard)/data-provider";

export function workspacePlanBadgeLabel(workspace: Workspace) {
  return workspace.plan ?? "unpaid";
}

export function WorkspacePlanBadge({
  className,
  size = "default",
  workspace,
}: {
  className?: string;
  size?: "default" | "sm";
  workspace: Workspace;
}) {
  return (
    <Badge
      variant="outline"
      status={getBillingPaymentStatus(workspace.billingStatus)}
      className={twx(
        "uppercase",
        size === "sm" && "px-1.5 py-0 text-[10px] leading-4 tracking-normal",
        className,
      )}
    >
      {workspacePlanBadgeLabel(workspace)}
    </Badge>
  );
}

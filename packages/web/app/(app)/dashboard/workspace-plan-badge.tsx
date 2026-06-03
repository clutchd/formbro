import { twx } from "@formbro/shared/twx";
import { Badge } from "@formbro/ui/badge";

type WorkspaceBillingSummary = {
  billingStatus?: string;
  plan?: string;
};

export function isUnpaidWorkspace(workspace: WorkspaceBillingSummary) {
  return workspace.billingStatus === "not_subscribed" || !workspace.plan;
}

export function workspacePlanBadgeLabel(workspace: WorkspaceBillingSummary) {
  if (isUnpaidWorkspace(workspace)) {
    return "unpaid";
  }

  return workspace.plan;
}

export function WorkspacePlanBadge({
  className,
  size = "default",
  workspace,
}: {
  className?: string;
  size?: "default" | "sm";
  workspace: WorkspaceBillingSummary;
}) {
  const isUnpaid = isUnpaidWorkspace(workspace);

  return (
    <Badge
      variant="outline"
      status={isUnpaid ? "warning" : "success"}
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

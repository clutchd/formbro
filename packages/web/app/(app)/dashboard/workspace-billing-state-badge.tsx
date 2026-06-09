import { getWorkspaceBillingState } from "@formbro/convex/lib";
import { twx } from "@formbro/shared/twx";
import { Badge } from "@formbro/ui/badge";
import type { Workspace } from "./(dashboard)/data-provider";

export function WorkspaceBillingStateBadge({
  className,
  size = "default",
  workspace,
  children,
}: {
  className?: string;
  size?: "default" | "sm";
  workspace: Workspace;
  children: React.ReactNode;
}) {
  return (
    <Badge
      variant="outline"
      status={getWorkspaceBillingState(workspace.billingStatus)}
      className={twx(
        "uppercase",
        size === "sm" && "px-1.5 py-0 text-[10px] leading-4 tracking-normal",
        className,
      )}
    >
      {children}
    </Badge>
  );
}

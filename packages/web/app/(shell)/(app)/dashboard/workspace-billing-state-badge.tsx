import { getWorkspaceBillingStatusColor, type WorkspacePlan } from "@formbro/convex/billingUtils";
import { twx } from "@formbro/shared/twx";
import { Badge } from "@formbro/ui/badge";

export function WorkspaceBillingStateBadge({
  className,
  size = "default",
  workspace,
  children,
}: {
  className?: string;
  size?: "default" | "sm";
  workspace: { billingStatus?: string; plan?: WorkspacePlan };
  children: React.ReactNode;
}) {
  return (
    <Badge
      variant="outline"
      status={getWorkspaceBillingStatusColor(workspace)}
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

import { getWorkspaceLimits, GIBIBYTE, MEGABYTE, getWorkspacePlanLabel } from "@formbro/convex/lib";
import { twx } from "@formbro/shared/twx";
import { Card } from "@formbro/ui/card";
import { Progress } from "@formbro/ui/progress";
import { Separator } from "@formbro/ui/separator";
import { displayFont, tuiFont, TypographySubheading } from "@formbro/ui/typography";
import { WorkspaceBillingStateBadge } from "../../workspace-billing-state-badge";
import { useRequiredWorkspaceData } from "../data-provider";

const numberFormatter = new Intl.NumberFormat("en-US");
const storageFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

function formatStorage(value: number) {
  if (value >= GIBIBYTE) {
    return `${storageFormatter.format(value / GIBIBYTE)} GB`;
  }

  return `${storageFormatter.format(value / MEGABYTE)} MB`;
}

function Metric({
  className,
  label,
  children,
}: {
  className?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={twx("flex flex-1 flex-col")}>
      <p className={twx(tuiFont, "text-muted-foreground")}>{label}</p>
      <div className={twx(displayFont, "mt-1 flex items-center gap-2", className)}>{children}</div>
    </div>
  );
}

function LimitMeter({
  detail,
  formatValue = numberFormatter.format,
  label,
  limit,
  used,
}: {
  detail?: string;
  formatValue?: (value: number) => string;
  label: string;
  limit: number | null;
  used: number;
}) {
  const usedLabel = formatValue(used);
  const limitLabel = limit === null ? "Unlimited" : formatValue(limit);
  const progress =
    limit !== null && limit > 0 ? Math.min((used / limit) * 100, 100) : limit === null ? 0 : 100;

  return (
    <Metric className="flex-col items-start" label={label}>
      <div className="flex w-full flex-row items-baseline justify-between">
        <p className={twx(displayFont, "mt-1 flex-1 text-xl")}>
          {usedLabel}
          <span className={twx(tuiFont, "ml-2 font-medium text-muted-foreground")}>
            / {limitLabel}
          </span>
        </p>
        {detail ? (
          <p className={twx(tuiFont, "flex-1 text-right font-medium text-muted-foreground")}>
            {detail}
          </p>
        ) : null}
      </div>
      <Progress value={progress} />
    </Metric>
  );
}

export function BillingLimits() {
  const { forms, workspace } = useRequiredWorkspaceData();
  const limits = getWorkspaceLimits(workspace);
  const activeForms = forms?.filter((form) => form.status !== "archived").length ?? 0;
  const monthlySubmissions = 0; // TODO: get from workspace
  const storageBytes = 0; // TODO: get from workspace

  return (
    <Card>
      <TypographySubheading className={twx(tuiFont, "mb-5")}>Limits</TypographySubheading>

      <div className="flex flex-col gap-5 sm:flex-row">
        <Metric label="Plan">
          {getWorkspacePlanLabel(workspace.plan)}
          <WorkspaceBillingStateBadge workspace={workspace}>
            {workspace.billingStatus}
          </WorkspaceBillingStateBadge>
        </Metric>
        <Metric label="Seats">Unlimited</Metric>
      </div>

      <Separator className="my-6" />

      <div className="flex flex-col gap-5">
        <LimitMeter label="Active forms" used={activeForms} limit={limits.activeForms} />
        <LimitMeter
          label="Submissions"
          used={monthlySubmissions}
          limit={limits.monthlySubmissions}
          detail="Resets monthly"
        />
        <LimitMeter
          label="Storage"
          used={storageBytes}
          limit={limits.storageBytes}
          formatValue={formatStorage}
        />
      </div>
    </Card>
  );
}

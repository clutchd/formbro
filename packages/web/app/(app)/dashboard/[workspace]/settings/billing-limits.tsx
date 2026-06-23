import { dateFormatter, formatStorage, numberFormatter } from "@formbro/convex/lib";
import { twx } from "@formbro/shared/twx";
import { Card } from "@formbro/ui/card";
import { Progress } from "@formbro/ui/progress";
import { Separator } from "@formbro/ui/separator";
import { displayFont, tuiFont, TypographySubheading } from "@formbro/ui/typography";
import { WorkspaceBillingStateBadge } from "../../workspace-billing-state-badge";
import { useRequiredWorkspaceSettingsData } from "./_data-provider";

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
  const { billing, workspace } = useRequiredWorkspaceSettingsData();

  return (
    <Card>
      <TypographySubheading className={twx(tuiFont, "mb-5")}>Limits</TypographySubheading>

      <div className="flex flex-col gap-5 sm:flex-row">
        <Metric label="Plan">
          {billing.planLabel}
          <WorkspaceBillingStateBadge workspace={workspace}>
            {workspace.billingStatus}
          </WorkspaceBillingStateBadge>
        </Metric>
        <Metric label="Seats">Unlimited</Metric>
      </div>

      <Separator className="my-6" />

      <div className="flex flex-col gap-5">
        <LimitMeter label="Forms" used={billing.usage.forms} limit={billing.limits.forms ?? null} />
        <LimitMeter
          label="Submissions"
          used={billing.usage.monthlySubmissions}
          limit={billing.limits.monthlySubmissions ?? null}
          detail={`Resets on ${dateFormatter.format(new Date(billing.usage.monthlySubmissionPeriod.end))}`}
        />
        <LimitMeter
          label="Storage"
          used={billing.usage.storageBytes}
          limit={billing.limits.storageBytes ?? null}
          formatValue={formatStorage}
        />
      </div>
    </Card>
  );
}

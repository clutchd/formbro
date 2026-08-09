import { api } from "@formbro/convex/_generated/api";
import { getPlanDetails, PLANS, type Plan } from "@formbro/convex/billingUtils";
import { getErrorMessage } from "@formbro/convex/errors";
import { formatUsd } from "@formbro/convex/lib";
import { APP_URL } from "@formbro/shared/brand";
import { twx } from "@formbro/shared/twx";
import { Badge } from "@formbro/ui/badge";
import { Button } from "@formbro/ui/button";
import { Card } from "@formbro/ui/card";
import { Separator } from "@formbro/ui/separator";
import { Spinner } from "@formbro/ui/spinner";
import { displayFont, tuiFont, TypographySubheading } from "@formbro/ui/typography";
import { RiCheckboxCircleLine } from "@remixicon/react";
import { useAction } from "convex/react";
import { redirect } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useRequiredWorkspaceSettingsData } from "./_data-provider";

function BillingIntervalToggle({
  interval,
  onChange,
}: {
  interval: "monthly" | "annual";
  onChange: (interval: "monthly" | "annual") => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="inline-flex w-fit rounded-lg border bg-muted/40 p-0.5">
        <button
          type="button"
          onClick={() => onChange("monthly")}
          className={twx(
            "cursor-pointer rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
            interval === "monthly"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => onChange("annual")}
          className={twx(
            "flex cursor-pointer items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
            interval === "annual"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Annual
          <Badge variant="outline" status="success" className="px-1.5 py-0 text-[10px] uppercase">
            2 mo free
          </Badge>
        </button>
      </div>

      <p className={twx(tuiFont, "text-muted-foreground")}>
        {interval === "annual" ? (
          <>
            Pay for 10 months, get <span className="text-foreground">12 months</span>
          </>
        ) : (
          "Save 2 months with annual billing"
        )}
      </p>
    </div>
  );
}

function PlanCard({
  current,
  disabled,
  interval,
  isLoading,
  onSelect,
  plan: planName,
  recommended,
}: {
  current: boolean;
  disabled: boolean;
  interval: "monthly" | "annual";
  isLoading: boolean;
  onSelect: () => void;
  plan: Plan;
  recommended: boolean;
}) {
  const plan = getPlanDetails(planName);
  const isFree = planName === "free";

  return (
    <Card className="row-span-4 grid h-full grid-rows-subgrid gap-y-5">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className={twx(displayFont, "text-xl")}>{plan.name}</h2>
          {current ? (
            <Badge variant="outline" status="success" className="shrink-0 uppercase">
              Current
            </Badge>
          ) : recommended ? (
            <Badge variant="outline" status="neutral" className="shrink-0 uppercase">
              Recommended
            </Badge>
          ) : (
            <span className="invisible shrink-0" aria-hidden="true">
              <Badge variant="outline" status="neutral" className="uppercase">
                Recommended
              </Badge>
            </span>
          )}
        </div>

        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
      </div>

      <div>
        <div className="flex items-end gap-2">
          <p className={twx(displayFont, "text-3xl")}>
            {interval === "annual"
              ? formatUsd(plan.yearlyPriceUsd / 12)
              : formatUsd(plan.monthlyPriceUsd)}
            <span className={twx(tuiFont, "ml-1.5 font-medium text-muted-foreground")}></span>
          </p>
        </div>

        {interval === "annual" ? (
          <p className={twx(tuiFont, "mt-2 text-muted-foreground")}>
            per month, billed yearly · save{" "}
            {formatUsd(plan.monthlyPriceUsd * 12 - plan.yearlyPriceUsd)}
          </p>
        ) : (
          <p className={twx(tuiFont, "mt-2 text-muted-foreground")}>per month</p>
        )}
      </div>

      <div className="flex min-h-0 flex-col">
        <Separator className="mb-5" />

        <ul className="flex flex-1 flex-col gap-2.5 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <RiCheckboxCircleLine className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <Button
          size="lg"
          className="w-full"
          disabled={disabled || isLoading}
          variant={current ? "outline" : "default"}
          onClick={() => {
            if (!current && !disabled) {
              onSelect();
            }
          }}
        >
          {isLoading ? <Spinner /> : null}
          {current ? "Current plan" : isFree ? "Free plan" : `Choose ${plan.name}`}
        </Button>
      </div>
    </Card>
  );
}

export function PlansPanel() {
  const { billing, workspace } = useRequiredWorkspaceSettingsData();
  const createSubscriptionCheckout = useAction(api.billing.createSubscriptionCheckout);
  const isUnlimited = billing.plan === "unlimited";
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);

  const settingsUrl = `${APP_URL}/dashboard/${workspace.slug}/settings`;

  const handleSelectPlan = useCallback(
    async (plan: Plan) => {
      setLoadingPlan(plan);

      const result = await createSubscriptionCheckout({
        workspaceId: billing.workspaceId,
        plan,
        interval,
        successUrl: `${settingsUrl}?checkout=success`,
        cancelUrl: `${settingsUrl}?checkout=cancelled`,
      });

      if (!result.ok) {
        setLoadingPlan(null);
        toast.error("Failed to start checkout", {
          description: getErrorMessage(result.error),
        });
        return;
      }

      setLoadingPlan(null);
      redirect(result.data.url);
    },
    [billing.workspaceId, createSubscriptionCheckout, interval, settingsUrl],
  );

  return (
    <section className="space-y-5 lg:col-span-2">
      <TypographySubheading className={twx(tuiFont, "mb-3")}>Plans</TypographySubheading>

      <BillingIntervalToggle interval={interval} onChange={setInterval} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-[auto_auto_1fr_auto]">
        {PLANS.map((plan) => {
          const current =
            billing.plan === plan && (billing.hasActiveSubscription || billing.plan === "free");
          const disabled =
            isUnlimited ||
            current ||
            !billing.canManageBilling ||
            (billing.hasActiveSubscription && !current);

          return (
            <PlanCard
              key={plan}
              plan={plan}
              interval={interval}
              current={current}
              recommended={plan === "pro" && !current}
              disabled={disabled}
              isLoading={loadingPlan === plan}
              onSelect={() => void handleSelectPlan(plan)}
            />
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { getWorkspaceBillingState } from "@formbro/convex/lib";
import { Page } from "@/components/page";
import { useRequiredWorkspaceData } from "../data-provider";
import { BillingLimits } from "./billing-limits";
import { ManageBilling } from "./manage-billing";
import { MembersPanel } from "./members-panel";
import { PlansPanel } from "./plans-panel";

export default function BillingSettingsPage() {
  const { workspace } = useRequiredWorkspaceData();
  const billingState = getWorkspaceBillingState(workspace?.billingStatus);

  return (
    <Page className="space-y-5">
      <ManageBilling />
      {billingState != "error" ? <BillingLimits /> : null}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3 lg:gap-4">
        <PlansPanel />
        <MembersPanel />
      </div>
    </Page>
  );
}

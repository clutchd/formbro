"use client";

import { hasActiveWorkspaceSubscriptionStatus } from "@formbro/convex/billingUtils";
import { Button } from "@formbro/ui/button";
import { RiBankCardLine, RiFileAiLine } from "@remixicon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loading } from "@/components/loading";
import { Page } from "@/components/page";
import { PageState } from "@/components/page-state";
import { useWorkspaceData } from "../_data-provider";
import { CreateForm } from "../create-form-form";
import { useWorkspaceSettingsPrewarmIntent } from "../settings/_data-provider";

export default function FormsDashboardContent() {
  const { workspace: workspaceSlug } = useParams<{ workspace: string }>();
  const { forms, workspace } = useWorkspaceData();
  const settingsPrewarm = useWorkspaceSettingsPrewarmIntent(workspaceSlug);

  if (!forms) {
    return <Loading title="forms" />;
  }

  if (workspace && !hasActiveWorkspaceSubscriptionStatus(workspace)) {
    return (
      <PageState
        icon={<RiBankCardLine />}
        title="Subscription required"
        description="Choose a plan to create forms and start collecting submissions."
      >
        <Button asChild>
          <Link {...settingsPrewarm}>
            <RiBankCardLine className="size-4" />
            Manage Billing
          </Link>
        </Button>
      </PageState>
    );
  }

  if (forms.length === 0) {
    return (
      <PageState
        icon={<RiFileAiLine />}
        title="No forms yet"
        description="Create your first form to start collecting data"
      >
        <CreateForm />
      </PageState>
    );
  }

  return <Page>Forms Here</Page>;
}

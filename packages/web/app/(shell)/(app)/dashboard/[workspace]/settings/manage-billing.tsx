import { api } from "@formbro/convex/_generated/api";
import { getErrorMessage } from "@formbro/convex/errors";
import { APP_URL } from "@formbro/shared/brand";
import { Button } from "@formbro/ui/button";
import { Spinner } from "@formbro/ui/spinner";
import { TypographyH1, TypographySubheading } from "@formbro/ui/typography";
import { RiExternalLinkLine } from "@remixicon/react";
import { useAction } from "convex/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useRequiredWorkspaceSettingsData } from "./_data-provider";

function ManageBillingButton() {
  const { billing, workspace } = useRequiredWorkspaceSettingsData();
  const [isLoading, setIsLoading] = useState(false);
  const createPortalSession = useAction(api.billing.createPortalSession);

  const handleManageBilling = async () => {
    setIsLoading(true);

    const result = await createPortalSession({
      workspaceId: workspace._id,
      returnUrl: `${APP_URL}/dashboard/${workspace.slug}/settings`,
    });

    if (!result.ok) {
      setIsLoading(false);
      toast.error("Failed to open billing portal", {
        description: getErrorMessage(result.error),
      });
      return;
    }

    setIsLoading(false);
    redirect(result.data.url);
  };

  if (!billing.canManageBilling) return null;

  return (
    <Button
      variant="outline"
      className="group/button"
      disabled={!billing.hasActiveSubscription}
      onClick={() => void handleManageBilling()}
    >
      Manage Billing {isLoading ? <Spinner /> : <RiExternalLinkLine className="size-4" />}
    </Button>
  );
}

export function ManageBilling() {
  const { workspace } = useRequiredWorkspaceSettingsData();

  return (
    <div className="flex flex-row items-center justify-between">
      <div>
        <TypographyH1>{workspace.name}</TypographyH1>
        <TypographySubheading className="lowercase">
          {`${APP_URL}/dashboard/${workspace.slug}`}
        </TypographySubheading>
      </div>
      <div>
        <ManageBillingButton />
      </div>
    </div>
  );
}

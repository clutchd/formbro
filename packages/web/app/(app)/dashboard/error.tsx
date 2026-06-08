"use client";

import { Alert, AlertDescription, AlertTitle } from "@formbro/ui/alert";
import { Button } from "@formbro/ui/button";
import { RiArrowLeftLine, RiErrorWarningLine, RiRefreshLine } from "@remixicon/react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import { IS_PROD } from "src/lib/env";
import { PageState } from "@/components/page-state";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        boundary: "dashboard",
      },
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <PageState
      error
      icon={<RiErrorWarningLine />}
      title="Dashboard unavailable"
      description={
        IS_PROD
          ? "Something went wrong while loading this dashboard. Try again, or head back to safety."
          : `Error: ${error.message}`
      }
    >
      <>
        <div className="flex w-full flex-col gap-2 *:w-full sm:flex-row sm:justify-center *:sm:w-auto">
          <Button type="button" size="lg" onClick={reset}>
            <RiRefreshLine className="size-4" />
            Try again
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">
              <RiArrowLeftLine className="size-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>
        {!IS_PROD ? (
          <Alert variant="destructive" className="w-full text-left">
            <RiErrorWarningLine className="size-4" />
            <AlertTitle>Debug details</AlertTitle>
            <AlertDescription>
              <p>{error.message}</p>
              {error.digest ? <p>Digest: {error.digest}</p> : null}
            </AlertDescription>
          </Alert>
        ) : null}
      </>
    </PageState>
  );
}

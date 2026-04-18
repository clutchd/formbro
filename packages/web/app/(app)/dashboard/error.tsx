"use client";

import { Alert, AlertDescription, AlertTitle } from "@formbro/ui/alert";
import { Button } from "@formbro/ui/button";
import { Card } from "@formbro/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@formbro/ui/empty";
import { RiArrowLeftLine, RiErrorWarningLine, RiRefreshLine } from "@remixicon/react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import { IS_PROD } from "src/lib/env";

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
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <Card className="w-full">
        <Empty className="gap-5 border-0 p-0 md:p-0">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="border-destructive-border text-destructive">
              <RiErrorWarningLine />
            </EmptyMedia>
            <EmptyTitle>Dashboard unavailable</EmptyTitle>
            <EmptyDescription>
              {IS_PROD
                ? "Something went wrong while loading this dashboard. Try again, or head back to safety."
                : `Error: ${error.message}`}
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <Button type="button" size="lg" className="w-full sm:w-auto" onClick={reset}>
                <RiRefreshLine className="size-4" />
                Try again
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/dashboard">
                  <RiArrowLeftLine className="size-4" />
                  Back to dashboard
                </Link>
              </Button>
            </div>

            {!IS_PROD ? (
              <Alert variant="destructive" className="w-full max-w-xl text-left">
                <RiErrorWarningLine className="size-4" />
                <AlertTitle>Debug details</AlertTitle>
                <AlertDescription>
                  <p>{error.message}</p>
                  {error.digest ? <p>Digest: {error.digest}</p> : null}
                </AlertDescription>
              </Alert>
            ) : null}
          </EmptyContent>
        </Empty>
      </Card>
    </div>
  );
}

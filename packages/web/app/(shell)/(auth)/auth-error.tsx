"use client";

import { Alert, AlertDescription } from "@formbro/ui/alert";
import { RiErrorWarningLine } from "@remixicon/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { IS_PROD } from "src/lib/env";
import { captureClientException } from "@/lib/posthog";

export function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  let decoded: string | null = null;
  if (error) {
    try {
      decoded = decodeURIComponent(error);
    } catch {
      decoded = error;
    }
  }

  useEffect(() => {
    if (!decoded) return;
    captureClientException(new Error(decoded), {
      source: "auth_redirect",
    });
  }, [decoded]);

  if (!decoded) return null;

  const message = IS_PROD ? "Error: Something went wrong. Please try again." : `Error: ${decoded}`;

  return (
    <Alert variant="destructive" className="mt-4">
      <RiErrorWarningLine className="size-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

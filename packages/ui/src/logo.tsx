import { APP_NAME } from "@formbro/shared/brand";
import { twx } from "@formbro/shared/twx";
import * as React from "react";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={twx("font-display text-2xl font-bold tracking-tight", className)}>
      {APP_NAME}
    </span>
  );
}

"use client";

import { twx } from "@formbro/shared/twx";
import { Progress as ProgressPrimitive } from "radix-ui";
import * as React from "react";

export function Progress({
  className,
  indicatorClass,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorClass?: string;
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={twx("relative h-2 w-full overflow-hidden rounded-full bg-primary/10", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={twx("h-full w-full flex-1 bg-primary", indicatorClass)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

import type * as React from "react";
import { twx } from "@formbro/shared/twx";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={twx("flex flex-col rounded-lg border bg-card p-5 text-card-foreground", className)}
      {...props}
    />
  );
}

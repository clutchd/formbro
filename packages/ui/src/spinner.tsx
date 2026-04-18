import { twx } from "@formbro/shared/twx";
import { RiLoader2Line } from "@remixicon/react";
import * as React from "react";

export function Spinner({ className, ...props }: React.ComponentProps<typeof RiLoader2Line>) {
  return (
    <RiLoader2Line
      role="status"
      aria-label="Loading"
      className={twx("size-4 animate-spin", className)}
      {...props}
    />
  );
}

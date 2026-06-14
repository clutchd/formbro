import type * as React from "react";
import { twx } from "@formbro/shared/twx";

export function Page({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <main className={twx("mx-auto w-full max-w-6xl px-5 py-8", className)}>{children}</main>;
}

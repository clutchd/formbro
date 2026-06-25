import { APP_NAME } from "@formbro/shared/brand";
import { twx } from "@formbro/shared/twx";
import Image from "next/image";
import * as React from "react";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={twx(
        "inline-flex items-center gap-2 font-display text-2xl font-bold tracking-tight",
        className,
      )}
    >
      <Image src="/logo.svg" alt={APP_NAME} height={16} width={16} />
      {APP_NAME}
    </span>
  );
}

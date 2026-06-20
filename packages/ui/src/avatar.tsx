"use client";

import { twx } from "@formbro/shared/twx";
import { tuiFont } from "@formbro/ui/typography";
import { Avatar as AvatarPrimitive } from "radix-ui";
import * as React from "react";

export function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={twx(
        "group/avatar relative flex size-9 shrink-0 overflow-hidden rounded-md border select-none data-[size=lg]:size-10 data-[size=sm]:size-6",
        className,
      )}
      {...props}
    />
  );
}

export function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={twx("aspect-square size-full", className)}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={twx(
        tuiFont,
        "flex size-full items-center justify-center bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

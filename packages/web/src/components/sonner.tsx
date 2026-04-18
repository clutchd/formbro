"use client";

import { Spinner } from "@formbro/ui/spinner";
import { RiCheckboxCircleLine, RiErrorWarningLine } from "@remixicon/react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      richColors={true}
      className="toaster group"
      icons={{
        success: <RiCheckboxCircleLine className="size-4" />,
        error: <RiErrorWarningLine className="size-4" />,
        loading: <Spinner />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

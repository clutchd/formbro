import { twx } from "@formbro/shared/twx";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

export const badgeVariants = cva(
  "font-mono inline-flex items-center justify-center border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
      status: {
        none: "",
        success:
          "select-none border-green-300 bg-green-100 text-green-950 dark:border-green-400/40 dark:bg-green-400/15 dark:text-green-200",
        warning:
          "select-none border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-400/40 dark:bg-amber-400/15 dark:text-amber-200",
        error:
          "select-none border-red-300 bg-red-100 text-red-950 dark:border-red-400/40 dark:bg-red-400/15 dark:text-red-200",
        info: "select-none border-blue-300 bg-blue-100 text-blue-950 dark:border-blue-400/40 dark:bg-blue-400/15 dark:text-blue-200",
        neutral: "select-none bg-muted text-muted-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
      status: "none",
    },
  },
);

export function Badge({
  className,
  variant,
  status,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={twx(badgeVariants({ variant, status }), className)}
      {...props}
    />
  );
}

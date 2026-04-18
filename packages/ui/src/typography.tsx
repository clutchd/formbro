import { twx } from "@formbro/shared/twx";
import * as React from "react";

export const displayFont = "font-display font-bold tracking-tight";
export const monoFont = "font-mono tracking-wider";
export const tuiFont = twx(monoFont, "text-xs uppercase");

const headingClasses = twx(displayFont, "scroll-m-10 text-balance");
export const h1 = twx(headingClasses, "text-2xl");
export const h2 = twx(headingClasses, "text-xl [&:not(:first-child)]:mt-2");
export const p = "[&:not(:first-child)]:mt-2";
export const inlineCode = twx(monoFont, "relative mx-0.25 bg-muted px-1.25 py-0.5 text-sm");

export function TypographyH1({ children, className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1 className={twx(h1, className)} {...props}>
      {children}
    </h1>
  );
}

export function TypographyH2({ children, className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h2 className={twx(h2, className)} {...props}>
      {children}
    </h2>
  );
}

export function TypographyP({ children, className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={twx(p, className)} {...props}>
      {children}
    </p>
  );
}

export function TypographyInlineCode({
  children,
  className,
  ...props
}: React.ComponentProps<"code">) {
  return (
    <code className={twx(inlineCode, className)} {...props}>
      {children}
    </code>
  );
}

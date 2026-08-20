import { FieldLabel as RootFieldLabel } from "@formbro/ui/field";
import * as React from "react";

export function FieldLabel({
  htmlFor,
  children,
}: Pick<React.ComponentProps<typeof RootFieldLabel>, "htmlFor" | "children">) {
  return (
    <RootFieldLabel className="font-display font-semibold tracking-tight" htmlFor={htmlFor}>
      {children}
    </RootFieldLabel>
  );
}

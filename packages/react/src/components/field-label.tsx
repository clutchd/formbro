import { FieldLabel as RootFieldLabel } from "@formbro/ui/field";
import * as React from "react";

export function FieldLabel({
  id,
  htmlFor,
  children,
}: Pick<React.ComponentProps<typeof RootFieldLabel>, "id" | "htmlFor" | "children">) {
  return (
    <RootFieldLabel id={id} className="font-display font-semibold tracking-tight" htmlFor={htmlFor}>
      {children}
    </RootFieldLabel>
  );
}

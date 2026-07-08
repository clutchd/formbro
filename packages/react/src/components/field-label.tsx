import * as React from "react";
import { FieldLabel as RootFieldLabel } from "./primitives.js";

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

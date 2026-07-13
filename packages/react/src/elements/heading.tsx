import type { FormLabel } from "@formbro/core/schema/label";
import { FieldLegend } from "../components/primitives.js";
import { cx } from "../utils/cx.js";

const headingSizes = {
  1: "!text-2xl",
  2: "!text-xl",
  3: "!text-lg",
} as const;

export function component({ level = 2, label }: { level?: 1 | 2 | 3; label?: FormLabel }) {
  if (!label) return null;

  return (
    <FieldLegend
      className={cx(
        "pt-4 font-display font-bold tracking-tight text-neutral-950",
        headingSizes[level],
      )}
    >
      {label}
    </FieldLegend>
  );
}

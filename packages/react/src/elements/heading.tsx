import type { FormLabel } from "@formbro/core/schema/label";
import { FieldLegend } from "../components/primitives.js";
import { cx } from "../utils/cx.js";

export function component({ level = 2, label }: { level?: 1 | 2 | 3; label?: FormLabel }) {
  if (!label) return null;

  let fontSize: string;
  switch (level) {
    case 1:
      fontSize = "!text-2xl";
      break;
    case 2:
      fontSize = "!text-xl";
      break;
    case 3:
      fontSize = "!text-lg";
      break;
  }

  return (
    <FieldLegend
      className={cx("pt-4 font-display font-bold tracking-tight text-neutral-950", fontSize)}
    >
      {label}
    </FieldLegend>
  );
}

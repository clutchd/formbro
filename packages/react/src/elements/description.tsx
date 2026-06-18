import type { FormLabel } from "@formbro/core/schema/label";
import { FieldDescription } from "@formbro/ui/field";
import { RiAlignLeft } from "@remixicon/react";
import * as React from "react";

export const icon = RiAlignLeft;
export const color = "bg-slate-100 text-slate-600";

export function component({ label }: { label?: FormLabel }) {
  if (!label) return null;
  return <FieldDescription className="leading-relaxed">{label}</FieldDescription>;
}

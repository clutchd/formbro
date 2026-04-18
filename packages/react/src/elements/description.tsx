import type { FormLabel } from "@formbro/core/schema/label";
import { FieldDescription } from "@formbro/ui/field";
import { RiAlignLeft } from "@remixicon/react";
import * as React from "react";

const DescriptionIcon = RiAlignLeft;
const DescriptionColor = "bg-slate-100 text-slate-600";

function Description({ label }: { label?: FormLabel }) {
  if (!label) return null;
  return <FieldDescription className="leading-relaxed">{label}</FieldDescription>;
}

export { DescriptionColor as color, Description as component, DescriptionIcon as icon };

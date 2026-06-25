import type { FormLabel } from "@formbro/core/schema/label";
import { FieldSeparator } from "@formbro/ui/field";
import { RiSeparator } from "@remixicon/react";

export const icon = RiSeparator;
export const color = "bg-gray-100 text-gray-600";

export function component({ label }: { label?: FormLabel }) {
  if (!label) return <FieldSeparator />;
  return <FieldSeparator>{label}</FieldSeparator>;
}

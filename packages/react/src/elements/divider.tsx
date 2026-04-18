import type { FormLabel } from "@formbro/core/schema/label";
import { FieldSeparator } from "@formbro/ui/field";
import { RiSeparator } from "@remixicon/react";
import * as React from "react";

const DividerIcon = RiSeparator;
const DividerColor = "bg-gray-100 text-gray-600";

function Divider({ label }: { label?: FormLabel }) {
  if (!label) return <FieldSeparator />;
  return <FieldSeparator>{label}</FieldSeparator>;
}

export { DividerColor as color, Divider as component, DividerIcon as icon };

import type { FormLabel } from "@formbro/core/schema/label";
import { FieldDescription } from "../components/primitives.js";

export function component({ label }: { label?: FormLabel }) {
  if (!label) return null;
  return <FieldDescription className="leading-relaxed">{label}</FieldDescription>;
}

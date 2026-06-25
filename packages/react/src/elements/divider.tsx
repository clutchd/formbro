import type { FormLabel } from "@formbro/core/schema/label";
import { FieldSeparator } from "../components/primitives.js";

export function component({ label }: { label?: FormLabel }) {
  if (!label) return <FieldSeparator className="my-4 sm:my-5" />;
  return <FieldSeparator className="my-4 sm:my-5">{label}</FieldSeparator>;
}

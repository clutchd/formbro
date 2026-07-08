import type { CompiledField } from "@formbro/core/compile";

export interface FieldComponentProps {
  schema: CompiledField;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  ariaRequired?: boolean;
}

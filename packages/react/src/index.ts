"use client";

export { Form, type CompiledFormProps, type FormProps } from "./components/form.js";
export { Field } from "./components/field.js";
export { FieldLabel } from "./components/field-label.js";
export { Page } from "./components/page.js";
export { SubmitButton } from "./components/submit-button.js";
export { useForm, type UseFormInstrumentation } from "./hooks/use-form.js";
export {
  ElementComponents,
  FieldComponents,
  getElementComponent,
  getFieldComponent,
  registryItems,
  type ElementComponent,
  type FieldComponent,
} from "./registry.js";
export type { FieldComponentProps } from "./types.js";

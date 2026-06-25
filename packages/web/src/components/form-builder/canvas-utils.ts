import type { FormInput } from "@formbro/core/schema/form";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

export type EditorElement = FormInput["elements"][number];
export type SubmitConfig = NonNullable<FormInput["submit"]>;

export const submitEditorId = "__formbro_submit__";

export function submitLabel(submit?: FormInput["submit"]) {
  return submit?.label?.trim() || "Submit";
}

export function updateSubmitConfig(
  current: FormInput["submit"],
  updater: (submit: SubmitConfig) => SubmitConfig,
) {
  return updater(current ?? {});
}

export function handleKeyboardSelect(event: ReactKeyboardEvent<HTMLElement>, onSelect: () => void) {
  if (event.target !== event.currentTarget) return;
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  event.stopPropagation();
  onSelect();
}

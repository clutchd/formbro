import type {
  FormRegistryEditor,
  FormRegistryEditorPreview,
  FormRegistryEditorProperty,
} from "./registry";
import type { FormRule, FormRuleType } from "./rule";
import {
  FieldRegistry,
  type FieldRegistryItem,
  type RegistryItem,
  type RegistryKey,
  Registry,
} from "../registry";
import { FormElementSchema, type FormElementInput, type FormFieldInput } from "./form";

const fieldKeys = new Set(FieldRegistry.map((item) => item.key));
const sharedFieldKeys = ["description", "placeholder", "orientation"] as const;

function registryEditorForType(type: RegistryKey): FormRegistryEditor {
  const item = Registry[type];
  return "editor" in item ? item.editor : undefined;
}

export function getRegistryRules(item: RegistryItem): FormRuleType[] {
  if (!("rules" in item)) return [];
  return Array.isArray(item.rules) ? [...item.rules] : [item.rules];
}

export function isFieldRegistryType(type: string): type is FieldRegistryItem["key"] {
  return fieldKeys.has(type as FieldRegistryItem["key"]);
}

export function registrySupportsRule(type: RegistryKey, rule: FormRuleType) {
  return getRegistryRules(Registry[type]).includes(rule);
}

export function getRegistryEditorMetadata(type: RegistryKey): FormRegistryEditor {
  return registryEditorForType(type);
}

export function getRegistryEditorPreview(type: RegistryKey): FormRegistryEditorPreview | undefined {
  return registryEditorForType(type)?.preview;
}

export function getRegistryEditorProperties(type: RegistryKey): FormRegistryEditorProperty[] {
  const properties = registryEditorForType(type)?.properties;
  return properties ? [...properties] : [];
}

export function labelForFormElement(element: FormElementInput) {
  if ("label" in element && typeof element.label === "string") return element.label;
  return element.name;
}

export function createFormElementId({
  elements,
  suffix = Date.now().toString(36),
  type,
}: {
  elements: readonly FormElementInput[];
  suffix?: string;
  type: RegistryKey;
}) {
  const taken = new Set(elements.map((element) => element.id));
  const prefix = type.replace(/[^a-z0-9_]/g, "_").replace(/^[^a-z]/, "field");
  let candidate = `${prefix}_${suffix}`.slice(0, 64);
  let index = 2;

  while (taken.has(candidate)) {
    candidate = `${prefix}_${suffix}_${index}`.slice(0, 64);
    index += 1;
  }

  return candidate;
}

export function createFormElementDraft({
  id,
  type,
}: {
  id: string;
  type: RegistryKey;
}): FormElementInput {
  const item = Registry[type];
  const defaults = registryEditorForType(type)?.defaults;

  return FormElementSchema.parse({
    id,
    name: item.display,
    type: item.key,
    ...defaults,
  });
}

export function convertFormElementDraftType({
  element,
  type,
}: {
  element: FormElementInput;
  type: RegistryKey;
}): FormElementInput {
  const label = labelForFormElement(element);
  const next = createFormElementDraft({ id: element.id, type });
  const current = element as Partial<FormFieldInput>;
  const draft = {
    ...next,
    id: element.id,
    name: label || element.name,
    label,
  } as FormElementInput & Partial<FormFieldInput>;

  if (isFieldRegistryType(type)) {
    for (const key of sharedFieldKeys) {
      if (current[key] !== undefined) {
        draft[key] = current[key] as never;
      }
    }

    if (type === "multi_select") {
      if (Array.isArray(current.default)) draft.default = current.default;
    } else if (current.default !== undefined && !Array.isArray(current.default)) {
      draft.default = current.default;
    }

    if (
      Array.isArray(current.options) &&
      Array.isArray((next as Partial<FormFieldInput>).options)
    ) {
      draft.options = current.options;
    }

    if (registrySupportsRule(type, "required")) {
      const requiredRule = current.rules?.find(
        (rule): rule is Extract<FormRule, { type: "required" }> => rule.type === "required",
      );
      if (requiredRule) {
        draft.rules = [requiredRule];
      }
    }
  }

  return FormElementSchema.parse(draft);
}

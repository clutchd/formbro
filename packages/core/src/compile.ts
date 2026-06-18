import type z from "zod";
import type { FormEvent } from "./schema/event";
import type { FormLabel } from "./schema/label";
import type { FormListener } from "./schema/listener";
import type { FormRule } from "./schema/rule";
import { type FormInput, FormSchema } from "./schema/form";
import { FORMBRO_SCHEMA_VERSION } from "./schema/version";

export function compile(schema: FormInput) {
  const parsed = FormSchema.parse(schema);
  const interpolated = interpolate(parsed, parsed.variables);
  const formId = interpolated.id;
  const version = compileVersion(interpolated.version);
  const { defaults, events, elements, fieldIds, validators } = compileElements(
    interpolated.elements,
  );
  const listeners = compileListeners(fieldIds, interpolated.listeners);
  const pages = compilePages(elements);
  const toasts = compileToasts(interpolated.toasts);

  const result = {
    id: formId,
    version,
    name: interpolated.name,
    defaults,
    events,
    listeners,
    validators,
    pages,
    toasts,
    submit: interpolated.submit,
  };

  return result;
}

export type CompiledForm = ReturnType<typeof compile>;
export type CompiledField = ReturnType<typeof compileField>;
export type CompiledElement = Extract<ReturnType<typeof compileElement>, { category: "element" }>;
export type CompiledAnyElement = CompiledElement | CompiledField;
export type CompiledSection = ReturnType<typeof compileSection>;
export type CompiledPage = ReturnType<typeof compilePages>[number];
export type CompiledFieldEvent = "change" | "blur" | "submit" | "mount";
export type CompiledListeners = ReturnType<typeof compileListeners>;
export type CompiledValidator = {
  type: CompiledField["type"];
  name: string;
  label?: string;
  rules: Partial<Record<FormEvent, FormRule[]>>;
};
export type CompiledValidators = Map<string, CompiledValidator>;

/** @internal */
export const _private = {
  compileLabel,
  compileElements,
  compileListeners,
  compilePages,
  compileToasts,
  compileVersion,
  interpolate,
};

function compileLabel(label: FormLabel, fallback?: string): string | undefined {
  if (typeof label === "string") return label;
  if (label === true && fallback) return fallback;
  return undefined;
}

function compileField(field: Extract<ReturnType<typeof compileElement>, { category: "field" }>) {
  const { default: defaultValue, rules, label, ...rest } = field;

  let required = false;

  const events: CompiledFieldEvent[] = rules
    ? Array.from(
        new Set<CompiledFieldEvent>(
          rules.map((rule) => {
            if (rule.type === "required" && rule.value) required = true;

            return rule.event
              ?.replace("on", "")
              .replace("Async", "")
              .toLowerCase() as CompiledFieldEvent;
          }),
        ),
      )
    : ["submit"];

  return {
    ...rest,
    label: compileLabel(label, field.name),
    default: defaultValue ?? "",
    events,
    required,
  };
}

function compileValidators(
  field: Extract<ReturnType<typeof compileElement>, { category: "field" }>,
) {
  const rules: Partial<Record<FormEvent, FormRule[]>> = {};

  for (const rule of field.rules ?? []) {
    const event = rule.event ?? "onChange";
    const eventRules = rules[event] ?? [];

    eventRules.push(rule);
    rules[event] = eventRules;
  }

  return {
    type: field.type,
    name: field.name,
    label: compileLabel(field.label, field.name),
    rules,
  };
}

function compileElement(element: z.output<typeof FormSchema>["elements"][number], index: number) {
  if ("label" in element) {
    const { label, ...rest } = element;
    return {
      ...rest,
      index,
      label: compileLabel(label, element.name),
    };
  }
  return {
    ...element,
    index,
  };
}

function compileElements(elements: z.output<typeof FormSchema>["elements"]) {
  const defaults: Record<string, unknown> = {};
  const events = new Map<string, Array<"change" | "blur" | "submit" | "mount">>();
  const fieldIds = new Set<string>();
  const validators: CompiledValidators = new Map();

  const compiled = elements.map((element, index) => {
    const compiled = compileElement(element, index);

    if (compiled.category === "field") {
      const compiledValidators = compileValidators(compiled);
      const field = compileField(compiled);
      fieldIds.add(field.id);
      events.set(field.id, field.events);
      defaults[field.id] = field.default;
      if (Object.keys(compiledValidators.rules).length > 0) {
        validators.set(field.id, compiledValidators);
      }
      return field;
    }

    return compiled;
  });

  return {
    defaults,
    elements: compiled,
    events,
    fieldIds,
    validators,
  };
}

function compileListeners(
  fieldIds: Set<string>,
  sourceListeners?: z.output<typeof FormSchema>["listeners"],
) {
  const listeners = new Map<
    string,
    Array<{
      event: "onChange";
      targetId: string;
      type: FormListener["type"];
    }>
  >();

  if (!sourceListeners || sourceListeners.length === 0) {
    return listeners;
  }

  for (const listener of sourceListeners) {
    const sourceId = listener.source;
    const targetId = listener.target;

    if (!fieldIds.has(sourceId)) {
      throw new Error(`Listener source not found: ${listener.source}`);
    }

    if (!fieldIds.has(targetId)) {
      throw new Error(`Listener target not found: ${listener.target}`);
    }

    if (sourceId === targetId) {
      throw new Error(`Listener source and target cannot be the same: ${listener.source}`);
    }

    const sourceSteps = listeners.get(sourceId) ?? [];
    sourceSteps.push({
      event: "onChange",
      targetId,
      type: listener.type,
    });
    listeners.set(sourceId, sourceSteps);
  }

  return listeners;
}

function compilePage() {
  return {
    label: undefined as string | undefined,
    fieldIds: new Array<string>(),
    elements: new Array<CompiledAnyElement>(),
    sections: new Array<CompiledSection>(),
  };
}

function compileSection(key: string, separator?: CompiledElement) {
  return {
    key,
    header: new Array<CompiledElement>(),
    body: new Array<CompiledField | CompiledElement>(),
    ...(separator ? { separator } : {}),
  };
}

function compilePages(elements: Array<CompiledAnyElement>) {
  const firstPage = compilePage();
  const pages = [firstPage];
  let page = firstPage;
  let section = compileSection("section-0");
  let sectionIdx = 0;

  const commitSection = (nextKey = `section-${sectionIdx + 1}`, separator?: CompiledElement) => {
    const hasContent = section.header.length > 0 || section.body.length > 0;

    if (hasContent) {
      page.sections.push(separator ? { ...section, separator } : section);
    } else if (separator) {
      const prev = page.sections[page.sections.length - 1];
      if (prev) prev.separator = separator;
      else page.sections.push(compileSection(section.key, separator));
    }

    sectionIdx += 1;
    section = compileSection(nextKey);
  };

  const commitPage = (label?: string) => {
    if (page.elements.length === 0) return;
    commitSection();
    page.label = label;
    page = compilePage();
    pages.push(page);
    section = compileSection("section-0");
    sectionIdx = 0;
  };

  for (const el of elements) {
    if (el.type === "page_break") {
      commitPage(el.label);
      continue;
    }

    page.elements.push(el);

    if (el.category === "field") {
      page.fieldIds.push(el.id);
      section.body.push(el);
    } else if (el.type === "heading") {
      commitSection(el.id);
      section.header.push(el);
    } else if (el.type === "description") {
      if (section.body.length > 0) {
        commitSection(el.id);
      }
      section.header.push(el);
    } else if (el.type === "divider") {
      commitSection(el.id, el);
    } else {
      section.body.push(el);
    }
  }

  if (page.elements.length > 0) {
    commitSection();
  }

  if (pages.length > 1 && pages[pages.length - 1]!.elements.length === 0) {
    pages.pop();
  }

  return pages;
}

function compileToasts(toasts: z.output<typeof FormSchema>["toasts"]) {
  const defaultToasts = {
    success: "Form submitted successfully!",
    error: "An error occurred while submitting the form",
    loading: "Submitting Form...",
  };

  return toasts === true
    ? defaultToasts
    : toasts
      ? {
          success:
            typeof toasts.success === "boolean" && toasts.success === false
              ? undefined
              : (toasts.success ?? defaultToasts.success),
          error:
            typeof toasts.error === "boolean" && toasts.error === false
              ? undefined
              : (toasts.error ?? defaultToasts.error),
          loading:
            typeof toasts.loading === "boolean" && toasts.loading === false
              ? undefined
              : (toasts.loading ?? defaultToasts.loading),
        }
      : undefined;
}

function compileVersion(version: z.output<typeof FormSchema>["version"]): string {
  if (version === undefined || version === null || version === "") {
    return FORMBRO_SCHEMA_VERSION;
  }

  if (typeof version === "number") {
    return `${version}.0.0`;
  }

  const parts = version.split(".");
  while (parts.length < 3) parts.push("0");
  return parts.slice(0, 3).join(".");
}

function interpolate<T>(schema: T, variables: Record<string, string> = {}): T {
  if (!variables) {
    return schema;
  }

  if (typeof schema === "string") {
    return schema.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return variables[key] ?? `{{${key}}}`;
    }) as T;
  }

  if (Array.isArray(schema)) {
    return schema.map((item) => interpolate(item, variables)) as T;
  }

  if (schema !== null && typeof schema === "object") {
    return Object.fromEntries(
      Object.entries(schema).map(([key, value]) => [
        key,
        key === "variables" || key === "id" ? value : interpolate(value, variables),
      ]),
    ) as T;
  }

  return schema;
}

import type z from "zod";
import type { FormEvent } from "./schema/event.js";
import type { FormLabel } from "./schema/label.js";
import type { FormListener } from "./schema/listener.js";
import type { FormRule } from "./schema/rule.js";
import { type FormInput, FormSchema } from "./schema/form.js";
import { FORMBRO_SCHEMA_VERSION } from "./schema/version.js";

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
export type CompiledPage = ReturnType<typeof compilePage>;
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

class PageCompiler {
  private readonly pages: CompiledPage[];
  private page: CompiledPage;
  private section = compileSection("section-0");
  private sectionIndex = 0;

  constructor() {
    const firstPage = compilePage();
    this.pages = [firstPage];
    this.page = firstPage;
  }

  add(element: CompiledAnyElement) {
    if (element.type === "page_break") {
      this.startPage(element.label);
      return;
    }

    this.page.elements.push(element);

    if (element.category === "field") {
      this.page.fieldIds.push(element.id);
      this.section.body.push(element);
      return;
    }

    this.addElementToSection(element);
  }

  finish() {
    if (this.page.elements.length > 0) {
      this.commitSection();
    }

    const lastPage = this.pages[this.pages.length - 1];
    if (this.pages.length > 1 && lastPage?.elements.length === 0) {
      this.pages.pop();
    }

    return this.pages;
  }

  private addElementToSection(element: CompiledElement) {
    if (element.type === "heading") {
      this.startSection(element.id);
      this.section.header.push(element);
      return;
    }

    if (element.type === "description") {
      if (this.section.body.length > 0) {
        this.startSection(element.id);
      }
      this.section.header.push(element);
      return;
    }

    if (element.type === "divider") {
      this.commitSection(element.id, element);
      return;
    }

    this.section.body.push(element);
  }

  private startPage(label?: string) {
    if (this.page.elements.length === 0) {
      this.page.label = label;
      return;
    }

    this.commitSection();
    this.page = compilePage();
    this.page.label = label;
    this.pages.push(this.page);
    this.section = compileSection("section-0");
    this.sectionIndex = 0;
  }

  private startSection(key: string) {
    this.commitSection(key);
  }

  private commitSection(nextKey = this.nextSectionKey(), separator?: CompiledElement) {
    const hasContent = this.section.header.length > 0 || this.section.body.length > 0;

    if (hasContent) {
      this.page.sections.push(separator ? { ...this.section, separator } : this.section);
    } else if (separator) {
      const previousSection = this.page.sections[this.page.sections.length - 1];
      if (previousSection) {
        previousSection.separator = separator;
      } else {
        this.page.sections.push(compileSection(this.section.key, separator));
      }
    }

    this.sectionIndex += 1;
    this.section = compileSection(nextKey);
  }

  private nextSectionKey() {
    return `section-${this.sectionIndex + 1}`;
  }
}

function compilePages(elements: Array<CompiledAnyElement>) {
  const pageCompiler = new PageCompiler();

  for (const el of elements) {
    pageCompiler.add(el);
  }

  return pageCompiler.finish();
}

const DEFAULT_TOASTS = {
  success: "Form submitted successfully!",
  error: "An error occurred while submitting the form",
  loading: "Submitting Form...",
};

function compileToasts(toasts: z.output<typeof FormSchema>["toasts"]) {
  if (!toasts) {
    return undefined;
  }

  if (toasts === true) {
    return { ...DEFAULT_TOASTS };
  }

  return {
    success: compileToastMessage(toasts.success, DEFAULT_TOASTS.success),
    error: compileToastMessage(toasts.error, DEFAULT_TOASTS.error),
    loading: compileToastMessage(toasts.loading, DEFAULT_TOASTS.loading),
  };
}

function compileToastMessage(message: string | false | undefined, fallback: string) {
  if (message === false) {
    return undefined;
  }

  return message ?? fallback;
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

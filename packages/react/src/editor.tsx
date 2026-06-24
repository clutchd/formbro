import type { FormInput } from "@formbro/core/schema/form";
import { twx } from "@formbro/shared/twx";
import { Button } from "@formbro/ui/button";
import { Input } from "@formbro/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@formbro/ui/select";
import { Switch } from "@formbro/ui/switch";
import { Textarea } from "@formbro/ui/textarea";
import { RiArrowDownSLine, RiCloseLine, RiEditLine, RiSettings3Line } from "@remixicon/react";
import * as React from "react";

export type EditorElement = FormInput["elements"][number];
export type EditorFieldElement = EditorElement & {
  description?: string;
  placeholder?: string;
  options?: string[];
  rules?: Array<{ type: string; value?: unknown }>;
};
export type EditorTransformOption = {
  color?: string;
  icon?: React.ComponentType<{ className?: string }>;
  key: string;
  label: string;
  rules?: readonly string[];
};
export type EditorProps<TElement extends EditorElement = EditorElement> = {
  element: TElement;
  onChange: (element: EditorElement) => void;
  onDeselect?: () => void;
  onSelect: () => void;
  onTransform?: (type: string) => void;
  selected: boolean;
  transformOptions?: EditorTransformOption[];
};

export type EditorPropertyKey =
  | "description"
  | "level"
  | "max"
  | "min"
  | "options"
  | "placeholder"
  | "required";
export type EditorPropertySection = "content" | "validation" | "behavior";
export type EditorPropertyDefinition = {
  key: string;
  className?: string;
  render: (context: EditorPropertyContext) => React.ReactNode;
  section: EditorPropertySection;
};
export type EditorProperty =
  | EditorPropertyKey
  | (Omit<EditorPropertyDefinition, "section"> & {
      section?: EditorPropertySection;
    });

export type EditorPropertyContext = EditorProps<EditorElement>;

export const defaultFieldEditorProperties = [
  "description",
  "placeholder",
] as const satisfies readonly EditorProperty[];

export const choiceFieldEditorProperties = [
  "description",
  "placeholder",
  "options",
] as const satisfies readonly EditorProperty[];

const editorPropertyDefinitions = {
  description: {
    key: "description",
    section: "content",
    render: ({ element, onChange }) => {
      const field = element as EditorFieldElement;

      return (
        <EditorPropertyField label="Helper text" htmlFor={`${element.id}-description`}>
          <Input
            id={`${element.id}-description`}
            value={field.description ?? ""}
            onChange={(event) =>
              onChange(setEditorElementValue(element, "description", event.target.value))
            }
            placeholder="Optional helper text"
          />
        </EditorPropertyField>
      );
    },
  },
  level: {
    key: "level",
    section: "content",
    render: ({ element, onChange }) => {
      const level = (element as { level?: unknown }).level;
      const value = typeof level === "number" ? String(level) : "2";

      return (
        <EditorPropertyField label="Size" htmlFor={`${element.id}-level`}>
          <Select
            value={value}
            onValueChange={(nextValue) =>
              onChange(setEditorElementValue(element, "level", Number(nextValue) as 1 | 2 | 3))
            }
          >
            <SelectTrigger id={`${element.id}-level`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Large</SelectItem>
              <SelectItem value="2">Medium</SelectItem>
              <SelectItem value="3">Small</SelectItem>
            </SelectContent>
          </Select>
        </EditorPropertyField>
      );
    },
  },
  max: {
    key: "max",
    section: "validation",
    render: ({ element, onChange }) => {
      const field = element as EditorFieldElement;
      const rule = getEditorFieldRule(field, "max");
      const enabled = typeof rule?.value === "number";
      const defaultValue = field.type === "number" ? 100 : 240;

      return (
        <EditorRuleOption
          checked={enabled}
          label={field.type === "number" ? "Maximum value" : "Max characters"}
          onCheckedChange={(checked) =>
            onChange(setEditorNumberRule(field, "max", checked ? defaultValue : undefined))
          }
        >
          {enabled ? (
            <Input
              value={String(rule.value)}
              onChange={(event) =>
                onChange(setEditorNumberRule(field, "max", Number(event.target.value || 0)))
              }
              className="h-8 w-20"
              min={0}
              type="number"
              aria-label={field.type === "number" ? "Maximum value" : "Max characters"}
            />
          ) : null}
        </EditorRuleOption>
      );
    },
  },
  min: {
    key: "min",
    section: "validation",
    render: ({ element, onChange }) => {
      const field = element as EditorFieldElement;
      const rule = getEditorFieldRule(field, "min");
      const enabled = typeof rule?.value === "number";
      const defaultValue = field.type === "number" ? 0 : 1;

      return (
        <EditorRuleOption
          checked={enabled}
          label={field.type === "number" ? "Minimum value" : "Min characters"}
          onCheckedChange={(checked) =>
            onChange(setEditorNumberRule(field, "min", checked ? defaultValue : undefined))
          }
        >
          {enabled ? (
            <Input
              value={String(rule.value)}
              onChange={(event) =>
                onChange(setEditorNumberRule(field, "min", Number(event.target.value || 0)))
              }
              className="h-8 w-20"
              min={0}
              type="number"
              aria-label={field.type === "number" ? "Minimum value" : "Min characters"}
            />
          ) : null}
        </EditorRuleOption>
      );
    },
  },
  options: {
    key: "options",
    section: "content",
    className: "md:col-span-2",
    render: ({ element, onChange }) => {
      const field = element as EditorFieldElement;

      return (
        <EditorPropertyField label="Options" htmlFor={`${element.id}-options`}>
          <Textarea
            id={`${element.id}-options`}
            value={getEditorOptionsText(field)}
            onChange={(event) => onChange(setEditorOptions(field, event.target.value))}
            className="min-h-28 font-mono text-sm"
            placeholder={"Option 1\nOption 2\nOption 3"}
          />
        </EditorPropertyField>
      );
    },
  },
  placeholder: {
    key: "placeholder",
    section: "content",
    render: ({ element, onChange }) => {
      const field = element as EditorFieldElement;

      return (
        <EditorPropertyField label="Placeholder" htmlFor={`${element.id}-placeholder`}>
          <Input
            id={`${element.id}-placeholder`}
            value={field.placeholder ?? ""}
            onChange={(event) =>
              onChange(setEditorElementValue(element, "placeholder", event.target.value))
            }
            placeholder="Input placeholder"
          />
        </EditorPropertyField>
      );
    },
  },
  required: {
    key: "required",
    section: "validation",
    render: ({ element, onChange }) => {
      const field = element as EditorFieldElement;

      return (
        <EditorRuleOption
          checked={isEditorFieldRequired(field)}
          label="Required"
          onCheckedChange={(checked) => onChange(setEditorFieldRequired(field, checked))}
        />
      );
    },
  },
} satisfies Record<EditorPropertyKey, EditorPropertyDefinition>;

export function editorLabelForElement(element: EditorElement) {
  if ("label" in element && typeof element.label === "string") return element.label;
  return element.name;
}

export function setEditorElementValue(
  element: EditorElement,
  key: string,
  value: unknown,
): EditorElement {
  return {
    ...element,
    [key]: value,
  } as EditorElement;
}

export function isEditorFieldRequired(element: EditorFieldElement) {
  return element.rules?.some((rule) => rule.type === "required" && rule.value) ?? false;
}

export function setEditorFieldRequired(
  element: EditorFieldElement,
  required: boolean,
): EditorFieldElement {
  const otherRules = element.rules?.filter((rule) => rule.type !== "required") ?? [];
  const rules = required ? [{ type: "required", value: true }, ...otherRules] : otherRules;

  return {
    ...element,
    rules: rules.length > 0 ? rules : undefined,
  };
}

export function getEditorFieldRule(element: EditorFieldElement, type: string) {
  return element.rules?.find((rule) => rule.type === type);
}

export function setEditorNumberRule(
  element: EditorFieldElement,
  type: "max" | "min",
  value: number | undefined,
): EditorFieldElement {
  const otherRules = element.rules?.filter((rule) => rule.type !== type) ?? [];
  const rules =
    typeof value === "number" && Number.isFinite(value)
      ? [...otherRules, { type, value }]
      : otherRules;

  return {
    ...element,
    rules: rules.length > 0 ? rules : undefined,
  };
}

export function getEditorOptionsText(element: EditorFieldElement) {
  return Array.isArray(element.options) ? element.options.join("\n") : "";
}

export function setEditorOptions(element: EditorFieldElement, value: string): EditorFieldElement {
  const options = value
    .split("\n")
    .map((option) => option.trim())
    .filter(Boolean);

  return {
    ...element,
    options: options.length > 0 ? options : ["Option 1"],
  };
}

export function EditorInlineTextInput({
  ariaLabel,
  className,
  onChange,
  onFocus,
  placeholder,
  value,
}: {
  ariaLabel: string;
  className?: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  placeholder: string;
  value: string;
}) {
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onFocus={onFocus}
      className={twx(
        "h-auto rounded-none border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0",
        className,
      )}
      placeholder={placeholder}
      aria-label={ariaLabel}
    />
  );
}

export function EditorInputPreview({
  element,
  fallbackPlaceholder,
  type = "text",
}: {
  element: EditorFieldElement;
  fallbackPlaceholder: string;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <Input
      readOnly
      tabIndex={-1}
      placeholder={element.placeholder || fallbackPlaceholder}
      className="pointer-events-none bg-background"
      type={type}
    />
  );
}

export function EditorTextareaPreview({
  element,
  fallbackPlaceholder,
}: {
  element: EditorFieldElement;
  fallbackPlaceholder: string;
}) {
  return (
    <Textarea
      readOnly
      tabIndex={-1}
      placeholder={element.placeholder || fallbackPlaceholder}
      className="pointer-events-none min-h-24 resize-none bg-background"
    />
  );
}

export function EditorSelectPreview({
  element,
  fallbackPlaceholder,
}: {
  element: EditorFieldElement;
  fallbackPlaceholder: string;
}) {
  return (
    <div className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm text-muted-foreground">
      <span>{element.placeholder || fallbackPlaceholder}</span>
      <RiArrowDownSLine className="size-4" />
    </div>
  );
}

export function EditorPanel<TElement extends EditorElement>({
  children,
  element,
  onChange,
  onDeselect,
  onTransform,
  properties,
  transformOptions,
}: EditorProps<TElement> & {
  children?: React.ReactNode;
  properties: readonly EditorProperty[];
}) {
  const [requestedTab, setRequestedTab] = React.useState<"edit" | "options">("edit");
  const context: EditorPropertyContext = {
    element,
    onChange,
    onDeselect,
    onSelect: () => {},
    onTransform,
    selected: true,
    transformOptions,
  };
  const renderedProperties = properties
    .map((property) => renderEditorProperty(property, context))
    .filter(Boolean);
  const editProperties = renderedProperties.filter((property) => property.section === "content");
  const optionProperties = renderedProperties.filter((property) => property.section !== "content");
  const hasEditProperties = Boolean(children || editProperties.length > 0);
  const hasOptionProperties = optionProperties.length > 0;
  const activeTab = requestedTab === "options" && hasOptionProperties ? "options" : "edit";

  if (!hasEditProperties && !hasOptionProperties) return null;

  return (
    <div
      data-editor-settings
      className="overflow-hidden rounded-lg border bg-card shadow-sm"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/20 px-3 py-2">
        <EditorPanelTabs
          activeTab={activeTab}
          hasOptions={hasOptionProperties}
          onEdit={() => setRequestedTab("edit")}
          onOptions={() => setRequestedTab("options")}
        />
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          {onTransform && transformOptions?.length ? (
            <EditorTypeControl
              currentType={element.type}
              onTransform={onTransform}
              transformOptions={transformOptions}
            />
          ) : null}
          {onDeselect ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="size-8 rounded-full border bg-background p-0"
              aria-label="Deselect element"
              onClick={onDeselect}
            >
              <RiCloseLine className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
      <div className="p-3">
        {activeTab === "edit" && hasEditProperties ? (
          <div className="space-y-3">
            {children}
            {editProperties.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {editProperties.map((property) => property.content)}
              </div>
            ) : null}
          </div>
        ) : null}
        {activeTab === "options" && hasOptionProperties ? (
          <div className="-m-3">{optionProperties.map((property) => property.content)}</div>
        ) : null}
      </div>
    </div>
  );
}

export function FieldEditor({
  children,
  element,
  onChange,
  onDeselect,
  onSelect,
  onTransform,
  properties,
  selected,
  settingsTitle = "Question",
  transformOptions,
}: EditorProps<EditorFieldElement> & {
  children: React.ReactNode;
  properties?: readonly EditorProperty[];
  settingsTitle?: string;
}) {
  const editorProperties = resolveFieldEditorProperties(element, properties, transformOptions);

  if (selected) {
    return (
      <EditorPanel
        element={element}
        onChange={onChange}
        onDeselect={onDeselect}
        onSelect={onSelect}
        onTransform={onTransform}
        properties={editorProperties}
        selected={selected}
        transformOptions={transformOptions}
      >
        <EditorPropertyField label={settingsTitle} htmlFor={`${element.id}-label`}>
          <Input
            id={`${element.id}-label`}
            value={editorLabelForElement(element)}
            onChange={(event) => {
              const value = event.target.value;
              onChange({
                ...setEditorElementValue(element, "label", value),
                name: value || element.name,
              });
            }}
            placeholder="Question"
          />
        </EditorPropertyField>
      </EditorPanel>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <EditorInlineTextInput
          value={editorLabelForElement(element)}
          placeholder="Question"
          ariaLabel="Question label"
          className="text-base font-semibold"
          onFocus={onSelect}
          onChange={(value) =>
            onChange({
              ...setEditorElementValue(element, "label", value),
              name: value || element.name,
            })
          }
        />
        {isEditorFieldRequired(element) ? <span className="text-destructive">*</span> : null}
      </div>
      {element.description ? (
        <p className="text-sm leading-6 text-muted-foreground">{element.description}</p>
      ) : null}
      {children}
    </div>
  );
}

function resolveFieldEditorProperties(
  element: EditorFieldElement,
  properties: readonly EditorProperty[] | undefined,
  transformOptions: readonly EditorTransformOption[] | undefined,
) {
  return dedupeEditorProperties([
    ...(properties ?? defaultFieldEditorProperties),
    ...getRuleEditorProperties(element.type, transformOptions),
  ]);
}

function getRuleEditorProperties(
  type: string,
  transformOptions: readonly EditorTransformOption[] | undefined,
) {
  const supportedRules = transformOptions?.find((option) => option.key === type)?.rules;
  if (!supportedRules) return ["required"] as const;

  return supportedRules.filter(isVisibleRuleProperty);
}

function isVisibleRuleProperty(
  rule: string,
): rule is Extract<EditorPropertyKey, "max" | "min" | "required"> {
  return rule === "required" || rule === "min" || rule === "max";
}

function dedupeEditorProperties(properties: readonly EditorProperty[]) {
  const seen = new Set<string>();
  const next: EditorProperty[] = [];

  for (const property of properties) {
    const key = typeof property === "string" ? property : property.key;
    if (seen.has(key)) continue;

    seen.add(key);
    next.push(property);
  }

  return next;
}

export function EditorPanelTabs({
  activeTab,
  hasOptions,
  onEdit,
  onOptions,
}: {
  activeTab: "edit" | "options";
  hasOptions: boolean;
  onEdit: () => void;
  onOptions: () => void;
}) {
  return (
    <div className="inline-flex rounded-md border bg-background p-0.5">
      <button
        type="button"
        className={twx(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-2.5 py-1 text-sm font-medium transition-colors",
          activeTab === "edit"
            ? "bg-foreground text-background shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        onClick={onEdit}
      >
        <RiEditLine className="size-3.5" />
        Edit
      </button>
      {hasOptions ? (
        <button
          type="button"
          className={twx(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-2.5 py-1 text-sm font-medium transition-colors",
            activeTab === "options"
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={onOptions}
        >
          <RiSettings3Line className="size-3.5" />
          Options
        </button>
      ) : null}
    </div>
  );
}

function EditorTypeControl({
  currentType,
  onTransform,
  transformOptions,
}: {
  currentType: string;
  onTransform: (type: string) => void;
  transformOptions: EditorTransformOption[];
}) {
  const selectedOption = transformOptions.find((option) => option.key === currentType);
  const SelectedIcon = selectedOption?.icon;

  return (
    <Select value={currentType} onValueChange={(value) => onTransform(value)}>
      <SelectTrigger className="h-8 w-44 bg-background">
        <span className="flex min-w-0 items-center gap-2">
          {SelectedIcon ? (
            <span
              className={twx(
                "flex size-5 shrink-0 items-center justify-center border",
                selectedOption.color ?? "bg-muted text-muted-foreground",
              )}
            >
              <SelectedIcon className="size-3.5" />
            </span>
          ) : null}
          <span className="truncate">{selectedOption?.label ?? currentType}</span>
        </span>
      </SelectTrigger>
      <SelectContent>
        {transformOptions.map((option) => {
          const Icon = option.icon;

          return (
            <SelectItem key={option.key} value={option.key}>
              <span className="flex items-center gap-2">
                {Icon ? (
                  <span
                    className={twx(
                      "flex size-5 items-center justify-center border",
                      option.color ?? "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                ) : null}
                {option.label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export function EditorPropertyField({
  children,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

function EditorRuleOption({
  checked,
  children,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  children?: React.ReactNode;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 border-b px-3 py-2 last:border-b-0">
      <span className="text-sm text-foreground">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        {children}
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </span>
    </div>
  );
}

function renderEditorProperty(property: EditorProperty, context: EditorPropertyContext) {
  const definition =
    typeof property === "string"
      ? editorPropertyDefinitions[property]
      : {
          section: "content" as const,
          ...property,
        };
  const content = definition.render(context);

  if (!content) return null;

  return {
    content: (
      <div key={definition.key} className={twx(definition.className)}>
        {content}
      </div>
    ),
    section: definition.section,
  };
}

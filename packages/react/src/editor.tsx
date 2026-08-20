import type { FormElementInput, FormFieldInput } from "@formbro/core/schema/form";
import type {
  FormRegistryEditorPreview,
  FormRegistryEditorProperty,
} from "@formbro/core/schema/registry";
import type { FormRule, FormRuleType } from "@formbro/core/schema/rule";
import { Registry, type RegistryKey } from "@formbro/core/registry";
import {
  getRegistryEditorProperties,
  getRegistryEditorPreview,
  isFieldRegistryType,
} from "@formbro/core/schema/editor";
import { twx } from "@formbro/shared/twx";
import { Button } from "@formbro/ui/button";
import { Input } from "@formbro/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@formbro/ui/select";
import { Switch } from "@formbro/ui/switch";
import { Textarea } from "@formbro/ui/textarea";
import {
  RiArrowDownSLine,
  RiCloseLine,
  RiEditLine,
  RiPageSeparator,
  RiSettings3Line,
} from "@remixicon/react";
import * as React from "react";

export type EditorTransformOption = {
  color?: string;
  icon?: React.ComponentType<{ className?: string }>;
  key: RegistryKey;
  label: string;
  rules?: readonly FormRuleType[];
};

export type EditorProps<TElement extends FormElementInput = FormElementInput> = {
  element: TElement;
  onChange: (element: FormElementInput) => void;
  onDeselect?: () => void;
  onSelect: () => void;
  onTransform?: (type: string) => void;
  selected: boolean;
  transformOptions?: EditorTransformOption[];
};

export type EditorElement = FormElementInput;
export type EditorProperty = FormRegistryEditorProperty;
export type EditorPropertyContext = EditorProps<FormElementInput>;

function isRegistryKey(type: string): type is RegistryKey {
  return type in Registry;
}

function registryDisplay(type: string) {
  return isRegistryKey(type) ? Registry[type].display : "Element";
}

function editorPropertyValue(element: FormElementInput, key: string) {
  return (element as Record<string, unknown>)[key];
}

function editorStringValue(element: FormElementInput, key: string) {
  const value = editorPropertyValue(element, key);
  return typeof value === "string" ? value : "";
}

function editorSelectValue(element: FormElementInput, property: EditorProperty) {
  const value = editorPropertyValue(element, property.key);
  if (typeof value === "number" || typeof value === "string") return String(value);
  return property.options?.[0]?.value ?? "";
}

function editorLabelForElement(element: FormElementInput) {
  if ("label" in element && typeof element.label === "string") return element.label;
  return element.name;
}

function setFormElementInputValue(
  element: FormElementInput,
  key: string,
  value: unknown,
): FormElementInput {
  return {
    ...element,
    [key]: value,
  } as FormElementInput;
}

function setEditorSchemaValue(element: FormElementInput, property: EditorProperty, value: unknown) {
  if (property.key === "label") {
    const label = typeof value === "string" ? value : String(value ?? "");

    return {
      ...setFormElementInputValue(element, "label", label),
      name: label || registryDisplay(element.type),
    };
  }

  if (property.control === "select" && property.inputType === "number") {
    return setFormElementInputValue(element, property.key, Number(value));
  }

  if (property.key === "level") {
    return setFormElementInputValue(element, property.key, Number(value) as 1 | 2 | 3);
  }

  return setFormElementInputValue(element, property.key, value);
}

function isEditorFieldRequired(element: FormFieldInput) {
  return element.rules?.some((rule) => rule.type === "required" && rule.value) ?? false;
}

function setEditorFieldRequired(element: FormFieldInput, required: boolean): FormFieldInput {
  const otherRules = element.rules?.filter((rule) => rule.type !== "required") ?? [];
  const rules = required
    ? ([{ type: "required", value: true }, ...otherRules] satisfies FormRule[])
    : otherRules;

  return {
    ...element,
    rules: rules.length > 0 ? rules : undefined,
  };
}

function getEditorFieldRule<TType extends FormRuleType>(element: FormFieldInput, type: TType) {
  return element.rules?.find(
    (rule): rule is Extract<FormRule, { type: TType }> => rule.type === type,
  );
}

function setEditorNumberRule(
  element: FormFieldInput,
  type: "max" | "min",
  value: number | undefined,
): FormFieldInput {
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

function getEditorOptionsText(element: FormFieldInput) {
  return Array.isArray(element.options) ? element.options.join("\n") : "";
}

function setEditorOptions(element: FormFieldInput, value: string): FormFieldInput {
  const options = value.split("\n").flatMap((option) => {
    const trimmed = option.trim();
    return trimmed ? [trimmed] : [];
  });

  return {
    ...element,
    options: options.length > 0 ? options : ["Option 1"],
  };
}

export function RegistryElementEditor(props: EditorProps) {
  const registryType = isRegistryKey(props.element.type) ? props.element.type : null;
  const properties = registryType ? getRegistryEditorProperties(registryType) : [];
  const preview = registryType ? getRegistryEditorPreview(registryType) : undefined;

  if (props.selected) {
    return <EditorPanel {...props} properties={properties} />;
  }

  return <EditorPreview {...props} preview={preview} />;
}

function EditorPreview({
  element,
  onChange,
  onSelect,
  preview,
}: EditorProps & {
  preview?: FormRegistryEditorPreview;
}) {
  if (isFieldRegistryType(element.type)) {
    return (
      <FieldEditorPreview
        element={element as FormFieldInput}
        onChange={onChange}
        onSelect={onSelect}
        preview={preview}
      />
    );
  }

  return (
    <ElementEditorPreview
      element={element}
      onChange={onChange}
      onSelect={onSelect}
      preview={preview}
    />
  );
}

function FieldEditorPreview({
  element,
  onChange,
  onSelect,
  preview,
}: {
  element: FormFieldInput;
  onChange: (element: FormElementInput) => void;
  onSelect: () => void;
  preview?: FormRegistryEditorPreview;
}) {
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
              ...setFormElementInputValue(element, "label", value),
              name: value || registryDisplay(element.type),
            })
          }
        />
        {isEditorFieldRequired(element) ? <span className="text-destructive">*</span> : null}
      </div>
      {element.description ? (
        <p className="text-sm leading-6 text-muted-foreground">{element.description}</p>
      ) : null}
      <PreviewControl
        element={element}
        onChange={onChange}
        onSelect={onSelect}
        preview={preview ?? { control: "input", placeholder: "Type your answer" }}
      />
    </div>
  );
}

function ElementEditorPreview({
  element,
  onChange,
  onSelect,
  preview,
}: {
  element: FormElementInput;
  onChange: (element: FormElementInput) => void;
  onSelect: () => void;
  preview?: FormRegistryEditorPreview;
}) {
  return (
    <PreviewControl
      element={element}
      onChange={onChange}
      onSelect={onSelect}
      preview={preview ?? { control: "description" }}
    />
  );
}

function PreviewControl({
  element,
  onChange,
  onSelect,
  preview,
}: {
  element: FormElementInput;
  onChange: (element: FormElementInput) => void;
  onSelect: () => void;
  preview: FormRegistryEditorPreview;
}) {
  switch (preview.control) {
    case "description":
      return (
        <Textarea
          value={editorLabelForElement(element)}
          rows={Math.max(1, editorLabelForElement(element).split("\n").length)}
          onFocus={onSelect}
          onChange={(event) =>
            onChange({
              ...setFormElementInputValue(element, "label", event.target.value),
              name: event.target.value || registryDisplay(element.type),
            })
          }
          aria-label="Description text"
          className="min-h-0 resize-none overflow-hidden rounded-none border-0 bg-transparent px-0 py-0 text-sm leading-relaxed text-muted-foreground shadow-none focus-visible:outline-none dark:bg-transparent"
          placeholder={preview.placeholder ?? "Description"}
        />
      );
    case "divider": {
      const label = editorStringValue(element, "label");

      return (
        <div className="space-y-3">
          <div className="h-px bg-border" />
          {label ? (
            <EditorInlineTextInput
              value={label}
              placeholder={preview.placeholder ?? "Divider label"}
              ariaLabel="Divider label"
              className="text-center text-sm text-muted-foreground"
              onFocus={onSelect}
              onChange={(value) => onChange(setFormElementInputValue(element, "label", value))}
            />
          ) : null}
        </div>
      );
    }
    case "heading": {
      const level = editorPropertyValue(element, "level");

      return (
        <EditorInlineTextInput
          value={editorLabelForElement(element)}
          placeholder={preview.placeholder ?? "Heading"}
          ariaLabel="Heading text"
          className={twx(
            "font-display font-bold tracking-tight text-foreground",
            level === 1 && "text-2xl md:text-2xl",
            (level ?? 2) === 2 && "text-xl md:text-xl",
            level === 3 && "text-lg md:text-lg",
          )}
          onFocus={onSelect}
          onChange={(value) =>
            onChange({
              ...setFormElementInputValue(element, "label", value),
              name: value || registryDisplay(element.type),
            })
          }
        />
      );
    }
    case "input":
      return (
        <EditorInputPreview
          element={element as FormFieldInput}
          fallbackPlaceholder={preview.placeholder ?? "Type your answer"}
          type={preview.inputType ?? "text"}
        />
      );
    case "page_break": {
      const pageTitle = editorStringValue(element, "label");

      return (
        <div className="py-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 border-t border-dashed" />
            <div className="flex max-w-full items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm shadow-sm">
              <RiPageSeparator className="size-4 shrink-0 text-muted-foreground" />
              <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                Page break
              </span>
              {pageTitle ? (
                <>
                  <span className="text-muted-foreground">/</span>
                  <span className="max-w-64 truncate font-medium">{pageTitle}</span>
                </>
              ) : null}
            </div>
            <div className="h-px flex-1 border-t border-dashed" />
          </div>
          <button
            type="button"
            className="mt-2 block w-full cursor-pointer text-center text-xs text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={(event) => {
              event.stopPropagation();
              onSelect();
            }}
          >
            {pageTitle ? "Edit next page title" : "Add optional next page title"}
          </button>
        </div>
      );
    }
    case "multi_select":
      return <EditorMultiSelectPreview element={element as FormFieldInput} />;
    case "radio_group":
      return <EditorRadioGroupPreview element={element as FormFieldInput} />;
    case "select":
      return (
        <EditorSelectPreview
          element={element as FormFieldInput}
          fallbackPlaceholder={preview.placeholder ?? "Select an option"}
        />
      );
    case "textarea":
      return (
        <EditorTextareaPreview
          element={element as FormFieldInput}
          fallbackPlaceholder={preview.placeholder ?? "Long answer"}
        />
      );
  }
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
        "h-auto rounded-none border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0 dark:bg-transparent",
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
  element: FormFieldInput;
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
  element: FormFieldInput;
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
  element: FormFieldInput;
  fallbackPlaceholder: string;
}) {
  return (
    <div className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm text-muted-foreground">
      <span>{element.placeholder || fallbackPlaceholder}</span>
      <RiArrowDownSLine className="size-4" />
    </div>
  );
}

export function EditorRadioGroupPreview({ element }: { element: FormFieldInput }) {
  const options =
    Array.isArray(element.options) && element.options.length > 0
      ? element.options
      : ["Option 1", "Option 2", "Option 3"];
  const validOptions = options.filter((option) => option.trim().length > 0);
  const fallbackOptions =
    validOptions.length > 0 ? validOptions : ["Option 1", "Option 2", "Option 3"];

  return (
    <div className="grid gap-3" aria-hidden="true">
      {fallbackOptions.map((option) => (
        <div key={option} className="flex items-center gap-3">
          <span className="size-4 shrink-0 rounded-full border border-input bg-background" />
          <span className="text-sm leading-normal">{option}</span>
        </div>
      ))}
    </div>
  );
}

export function EditorMultiSelectPreview({ element }: { element: FormFieldInput }) {
  const options =
    Array.isArray(element.options) && element.options.length > 0
      ? element.options
      : ["Option 1", "Option 2", "Option 3"];
  const validOptions = [...new Set(options.filter((option) => option.trim().length > 0))];
  const fallbackOptions =
    validOptions.length > 0 ? validOptions : ["Option 1", "Option 2", "Option 3"];

  return (
    <div className="grid gap-3" aria-hidden="true">
      {fallbackOptions.map((option) => (
        <div key={option} className="flex items-center gap-3">
          <span className="size-4 shrink-0 rounded-[4px] border border-input bg-background" />
          <span className="text-sm leading-normal">{option}</span>
        </div>
      ))}
    </div>
  );
}

export function EditorPanel<TElement extends FormElementInput>({
  element,
  onChange,
  onDeselect,
  onTransform,
  properties,
  transformOptions,
}: EditorProps<TElement> & {
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
  const renderedProperties = properties.map((property) => renderEditorProperty(property, context));

  const editProperties = renderedProperties.filter((property) => property.section === "content");
  const optionProperties = renderedProperties.filter((property) => property.section !== "content");
  const hasEditProperties = editProperties.length > 0;
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
          <div className="grid gap-3 md:grid-cols-2">
            {editProperties.map((property) => property.content)}
          </div>
        ) : null}
        {activeTab === "options" && hasOptionProperties ? (
          <div className="-m-3">{optionProperties.map((property) => property.content)}</div>
        ) : null}
      </div>
    </div>
  );
}

export function FieldEditor(props: EditorProps<FormFieldInput>) {
  return <RegistryElementEditor {...props} />;
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
  onTransform: (type: RegistryKey) => void;
  transformOptions: readonly EditorTransformOption[];
}) {
  const selectedOption = transformOptions.find((option) => option.key === currentType);
  const SelectedIcon = selectedOption?.icon;

  return (
    <Select value={currentType} onValueChange={(value) => onTransform(value as RegistryKey)}>
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
  const content = renderEditorPropertyControl(property, context);

  return {
    content: (
      <div
        key={property.key}
        className={twx((property.span === "full" || property.key === "label") && "md:col-span-2")}
      >
        {content}
      </div>
    ),
    section: property.section ?? "content",
  };
}

function renderEditorPropertyControl(property: EditorProperty, context: EditorPropertyContext) {
  switch (property.control) {
    case "options":
      return renderOptionsProperty(property, context);
    case "rule":
      return renderRuleProperty(property, context);
    case "select":
      return renderSelectProperty(property, context);
    case "textarea":
      return renderTextareaProperty(property, context);
    case "text":
      return renderTextProperty(property, context);
  }
}

function renderOptionsProperty(
  property: EditorProperty,
  { element, onChange }: EditorPropertyContext,
) {
  const field = element as FormFieldInput;

  return (
    <EditorPropertyField label={property.label} htmlFor={`${element.id}-${property.key}`}>
      <Textarea
        id={`${element.id}-${property.key}`}
        value={getEditorOptionsText(field)}
        onChange={(event) => onChange(setEditorOptions(field, event.target.value))}
        className="min-h-28 font-mono text-sm"
        placeholder={property.placeholder ?? "Option 1\nOption 2\nOption 3"}
      />
    </EditorPropertyField>
  );
}

function renderRuleProperty(
  property: EditorProperty,
  { element, onChange }: EditorPropertyContext,
) {
  const field = element as FormFieldInput;

  if (property.key === "required") {
    return (
      <EditorRuleOption
        checked={isEditorFieldRequired(field)}
        label={property.label}
        onCheckedChange={(checked) => onChange(setEditorFieldRequired(field, checked))}
      />
    );
  }

  if (property.key !== "min" && property.key !== "max") {
    return (
      <EditorRuleOption checked={false} label={property.label} onCheckedChange={() => undefined} />
    );
  }

  const ruleType = property.key;
  const rule = getEditorFieldRule(field, ruleType);
  const enabled = typeof rule?.value === "number";
  const defaultValue = typeof property.defaultValue === "number" ? property.defaultValue : 0;

  return (
    <EditorRuleOption
      checked={enabled}
      label={property.label}
      onCheckedChange={(checked) =>
        onChange(setEditorNumberRule(field, ruleType, checked ? defaultValue : undefined))
      }
    >
      {enabled ? (
        <Input
          value={String(rule.value)}
          onChange={(event) =>
            onChange(setEditorNumberRule(field, ruleType, Number(event.target.value || 0)))
          }
          className="h-8 w-20"
          min={0}
          type="number"
          aria-label={property.label}
        />
      ) : null}
    </EditorRuleOption>
  );
}

function renderSelectProperty(
  property: EditorProperty,
  { element, onChange }: EditorPropertyContext,
) {
  return (
    <EditorPropertyField label={property.label} htmlFor={`${element.id}-${property.key}`}>
      <Select
        value={editorSelectValue(element, property)}
        onValueChange={(value) => onChange(setEditorSchemaValue(element, property, value))}
      >
        <SelectTrigger id={`${element.id}-${property.key}`} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {property.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </EditorPropertyField>
  );
}

function renderTextareaProperty(
  property: EditorProperty,
  { element, onChange }: EditorPropertyContext,
) {
  return (
    <EditorPropertyField label={property.label} htmlFor={`${element.id}-${property.key}`}>
      <Textarea
        id={`${element.id}-${property.key}`}
        value={editorStringValue(element, property.key)}
        onChange={(event) => onChange(setEditorSchemaValue(element, property, event.target.value))}
        placeholder={property.placeholder}
        className="min-h-24 resize-none"
      />
    </EditorPropertyField>
  );
}

function renderTextProperty(
  property: EditorProperty,
  { element, onChange }: EditorPropertyContext,
) {
  return (
    <EditorPropertyField label={property.label} htmlFor={`${element.id}-${property.key}`}>
      <Input
        id={`${element.id}-${property.key}`}
        value={editorStringValue(element, property.key)}
        onChange={(event) => onChange(setEditorSchemaValue(element, property, event.target.value))}
        placeholder={property.placeholder}
        type={property.inputType ?? "text"}
      />
    </EditorPropertyField>
  );
}

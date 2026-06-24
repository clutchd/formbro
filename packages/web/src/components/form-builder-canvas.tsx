"use client";

import type { FormInput } from "@formbro/core/schema/form";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ElementRegistry, FieldRegistry } from "@formbro/core/registry";
import {
  EditorPanelTabs,
  type EditorProps,
  type EditorTransformOption,
} from "@formbro/react/editor";
import { ElementComponents, FieldComponents } from "@formbro/react/registry";
import { twx } from "@formbro/shared/twx";
import { Button } from "@formbro/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@formbro/ui/dialog";
import { Input } from "@formbro/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@formbro/ui/select";
import {
  RiAddLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiDraggable,
  RiSearchLine,
  RiSendPlaneLine,
} from "@remixicon/react";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

type EditorElement = FormInput["elements"][number];
type SubmitConfig = NonNullable<FormInput["submit"]>;
type RegistryItem = (typeof ElementRegistry)[number] | (typeof FieldRegistry)[number];
type RegistryKey = RegistryItem["key"];
type FieldRegistryItem = (typeof FieldRegistry)[number];
type RegistryEditor = (props: EditorProps<EditorElement>) => React.ReactNode;

const registryItems = [...ElementRegistry, ...FieldRegistry] as RegistryItem[];
const submitEditorId = "__formbro_submit__";
const fieldKeys = new Set(FieldRegistry.map((item) => item.key));
const registryByKey = new Map(registryItems.map((item) => [item.key, item]));
const transformOptions: EditorTransformOption[] = registryItems.map((item) => {
  const visual = getRegistryVisual(item.key);

  return {
    color: visual?.color,
    icon: visual?.icon,
    key: item.key,
    label: item.display,
    rules: getRegistryRules(item),
  };
});

const pickerGroups: Array<{ label: string; keys: RegistryKey[] }> = [
  { label: "Questions", keys: ["short_text", "long_text", "number"] },
  { label: "Choice", keys: ["single_select"] },
  { label: "Contact", keys: ["email", "link"] },
  { label: "Text/Layout", keys: ["heading", "description", "divider", "page_break"] },
];

function isFieldType(type: string): type is FieldRegistryItem["key"] {
  return fieldKeys.has(type as FieldRegistryItem["key"]);
}

function getRegistryItem(type: string) {
  return registryByKey.get(type as RegistryKey);
}

function getRegistryRules(item: RegistryItem) {
  if (!("rules" in item)) return [];
  return Array.isArray(item.rules) ? item.rules : [item.rules];
}

function getRegistryVisual(type: string) {
  if (type in ElementComponents) {
    return ElementComponents[type as keyof typeof ElementComponents];
  }

  if (type in FieldComponents) {
    return FieldComponents[type as keyof typeof FieldComponents];
  }

  return null;
}

function getRegistryEditor(type: string): RegistryEditor | null {
  const visual = getRegistryVisual(type);
  if (!visual || !("editor" in visual) || typeof visual.editor !== "function") return null;
  return visual.editor as RegistryEditor;
}

function registrySupportsRequired(type: string) {
  const item = getRegistryItem(type);
  if (!item) return false;
  return getRegistryRules(item).includes("required");
}

function createElementId(type: string, elements: EditorElement[]) {
  const taken = new Set(elements.map((element) => element.id));
  const prefix = type.replace(/[^a-z0-9_]/g, "_").replace(/^[^a-z]/, "field");
  let candidate = `${prefix}_${Date.now().toString(36)}`.slice(0, 64);
  let index = 2;

  while (taken.has(candidate)) {
    candidate = `${prefix}_${Date.now().toString(36)}_${index}`.slice(0, 64);
    index += 1;
  }

  return candidate;
}

function labelForElement(element: EditorElement) {
  if ("label" in element && typeof element.label === "string") return element.label;
  return element.name;
}

function submitLabel(submit?: FormInput["submit"]) {
  return submit?.label?.trim() || "Submit";
}

function updateSubmitConfig(
  current: FormInput["submit"],
  updater: (submit: SubmitConfig) => SubmitConfig,
) {
  return updater(current ?? {});
}

function handleKeyboardSelect(event: ReactKeyboardEvent<HTMLElement>, onSelect: () => void) {
  if (event.target !== event.currentTarget) return;
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  event.stopPropagation();
  onSelect();
}

function createRegistryElement(type: RegistryKey, elements: EditorElement[]): EditorElement {
  const item = getRegistryItem(type);
  const display = item?.display ?? "Question";
  const id = createElementId(type, elements);

  switch (type) {
    case "heading":
      return {
        id,
        name: display,
        type,
        label: "New heading",
        level: 2,
      } as EditorElement;
    case "description":
      return {
        id,
        name: display,
        type,
        label: "Add helpful context for this section.",
      } as EditorElement;
    case "divider":
      return {
        id,
        name: display,
        type,
      } as EditorElement;
    case "page_break":
      return {
        id,
        name: display,
        type,
      } as EditorElement;
    case "email":
      return {
        id,
        name: display,
        type,
        label: "Email",
        placeholder: "you@example.com",
      } as EditorElement;
    case "link":
      return {
        id,
        name: display,
        type,
        label: "Link",
        placeholder: "https://example.com",
      } as EditorElement;
    case "long_text":
      return {
        id,
        name: display,
        type,
        label: "Long answer",
        placeholder: "Share more detail",
      } as EditorElement;
    case "number":
      return {
        id,
        name: display,
        type,
        label: "Number",
        placeholder: "0",
      } as EditorElement;
    case "single_select":
      return {
        id,
        name: display,
        type,
        label: "Choose one",
        placeholder: "Select an option",
        options: ["Option 1", "Option 2", "Option 3"],
      } as EditorElement;
    case "short_text":
    default:
      return {
        id,
        name: display,
        type: "short_text",
        label: "Short answer",
        placeholder: "Type your answer",
      } as EditorElement;
  }
}

function convertElementType(
  element: EditorElement,
  type: RegistryKey,
  elements: EditorElement[],
): EditorElement {
  const next = createRegistryElement(type, elements) as EditorElement & {
    description?: string;
    label?: string | boolean;
    options?: string[];
    placeholder?: string;
    rules?: Array<{ type: string; value?: unknown }>;
  };
  const current = element as EditorElement & {
    description?: string;
    label?: string | boolean;
    options?: string[];
    placeholder?: string;
    rules?: Array<{ type: string; value?: unknown }>;
  };
  const label = labelForElement(element);

  next.id = element.id;
  next.name = label || element.name;
  next.label = label;

  if (isFieldType(type)) {
    next.description = current.description;
    next.placeholder = current.placeholder ?? next.placeholder;
    if (registrySupportsRequired(type)) {
      const required = current.rules?.find((rule) => rule.type === "required");
      next.rules = required ? [required] : next.rules;
    }
    if (type === "single_select") {
      next.options = Array.isArray(current.options) ? current.options : next.options;
    }
  }

  return next;
}

export function FormBuilderCanvas({
  schema,
  onSchemaChange,
  className,
}: {
  schema: FormInput;
  onSchemaChange: (updater: (schema: FormInput) => FormInput) => void;
  className?: string;
}) {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedElementId(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const addElement = (index: number, type: RegistryKey) => {
    const element = createRegistryElement(type, schema.elements);
    setSelectedElementId(element.id);
    onSchemaChange((current) => {
      const elements = [...current.elements];
      elements.splice(index, 0, element);
      return { ...current, elements };
    });
  };

  const updateElement = (elementId: string, updater: (element: EditorElement) => EditorElement) => {
    let nextElementId = elementId;
    onSchemaChange((current) => {
      const elements = current.elements.map((element) => {
        if (element.id !== elementId) return element;

        const nextElement = updater(element);
        nextElementId = nextElement.id;
        return nextElement;
      });
      return { ...current, elements };
    });
    setSelectedElementId(nextElementId);
  };

  const transformElement = (elementId: string, type: string) => {
    onSchemaChange((current) => {
      const elements = current.elements.map((element) =>
        element.id === elementId
          ? convertElementType(element, type as RegistryKey, current.elements)
          : element,
      );
      return { ...current, elements };
    });
  };

  const removeElement = (elementId: string) => {
    setSelectedElementId((current) => (current === elementId ? null : current));
    onSchemaChange((current) => ({
      ...current,
      elements: current.elements.filter((element) => element.id !== elementId),
    }));
  };

  const reorderElement = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    onSchemaChange((current) => {
      const oldIndex = current.elements.findIndex((element) => element.id === activeId);
      const newIndex = current.elements.findIndex((element) => element.id === overId);
      if (oldIndex < 0 || newIndex < 0) return current;

      return {
        ...current,
        elements: arrayMove(current.elements, oldIndex, newIndex),
      };
    });
    setSelectedElementId(activeId);
  };

  const updateFormName = (name: string) => {
    onSchemaChange((current) => ({ ...current, name: name || "Untitled form" }));
  };

  const updateSubmit = (updater: (submit: SubmitConfig) => SubmitConfig) => {
    onSchemaChange((current) => ({
      ...current,
      submit: updateSubmitConfig(current.submit, updater),
    }));
  };

  const elementIds = useMemo(() => schema.elements.map((element) => element.id), [schema.elements]);
  const selectedElementIsAvailable =
    selectedElementId === submitEditorId ||
    schema.elements.some((element) => element.id === selectedElementId);
  const activeSelectedElementId = selectedElementIsAvailable ? selectedElementId : null;
  const dndContextId = `form-builder-${schema.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  return (
    <div
      className={twx("w-full py-12 lg:py-16", className)}
      onClick={() => setSelectedElementId(null)}
      role="presentation"
    >
      <div className="mx-auto grid w-full max-w-[52rem] grid-cols-[2.25rem_minmax(0,48rem)] gap-2 px-3 sm:px-6">
        <div aria-hidden />
        <Input
          value={schema.name}
          onChange={(event) => updateFormName(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          className="mb-10 h-auto rounded-none border-0 bg-transparent px-0 py-0 font-display text-4xl font-bold tracking-tight shadow-none focus-visible:ring-0 md:text-5xl"
          aria-label="Form title"
        />
      </div>

      {schema.elements.length === 0 ? (
        <div className="mx-auto grid w-full max-w-[52rem] grid-cols-[2.25rem_minmax(0,48rem)] gap-2 px-3 sm:px-6">
          <div aria-hidden />
          <div className="my-8 rounded-lg border border-dashed px-6 py-12 text-center">
            <h2 className="font-display text-xl font-bold tracking-tight">Blank form</h2>
            <p className="mt-2 text-sm text-muted-foreground">No elements yet.</p>
            <div className="mt-5 flex justify-center">
              <ElementPicker onSelect={(type) => addElement(0, type)} trigger="empty" />
            </div>
          </div>
        </div>
      ) : null}

      {schema.elements.length > 0 ? (
        <DndContext
          id={dndContextId}
          sensors={sensors}
          collisionDetection={closestCenter}
          measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
          onDragEnd={reorderElement}
        >
          <SortableContext items={elementIds} strategy={verticalListSortingStrategy}>
            {schema.elements.map((element, index) => (
              <SortableEditorBlock
                key={element.id}
                element={element}
                selected={activeSelectedElementId === element.id}
                onAddAfter={(type) => addElement(index + 1, type)}
                onDeselect={() => setSelectedElementId(null)}
                onRemove={() => removeElement(element.id)}
                onSelect={() => setSelectedElementId(element.id)}
                onTransform={(type) => transformElement(element.id, type)}
                onUpdate={(updater) => updateElement(element.id, updater)}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : null}

      <SubmitButtonEditorBlock
        selected={activeSelectedElementId === submitEditorId}
        submit={schema.submit}
        onDeselect={() => setSelectedElementId(null)}
        onSelect={() => setSelectedElementId(submitEditorId)}
        onUpdate={updateSubmit}
      />
    </div>
  );
}

function ElementPicker({
  onSelect,
  trigger,
}: {
  onSelect: (type: RegistryKey) => void;
  trigger: "compact" | "empty";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const groups = useMemo(
    () => {
      const matchingGroups: Array<{
        items: RegistryItem[];
        keys: RegistryKey[];
        label: string;
      }> = [];

      for (const group of pickerGroups) {
        const items: RegistryItem[] = [];

        for (const key of group.keys) {
          const item = getRegistryItem(key);
          if (!item) continue;
          if (
            normalizedQuery &&
            !`${item.display} ${item.description} ${item.key}`
              .toLowerCase()
              .includes(normalizedQuery)
          ) {
            continue;
          }

          items.push(item);
        }

        if (items.length > 0) {
          matchingGroups.push({ ...group, items });
        }
      }

      return matchingGroups;
    },
    [normalizedQuery],
  );

  const select = (type: RegistryKey) => {
    onSelect(type);
    setQuery("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={trigger === "empty" ? "default" : "outline"}
          size={trigger === "empty" ? "dense" : "sm"}
          className={twx(
            trigger === "compact" && "size-7 rounded-full border-0 bg-transparent p-0",
            trigger === "empty" && "rounded-full",
          )}
          aria-label="Add form element"
          onClick={(event) => event.stopPropagation()}
        >
          <RiAddLine className="size-4" />
          {trigger === "empty" ? <span>Add element</span> : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[min(42rem,calc(100svh-2rem))] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-5 pt-5 pb-4">
          <DialogTitle>Add element</DialogTitle>
          <DialogDescription>Questions, content, and page breaks for this draft.</DialogDescription>
        </DialogHeader>
        <div className="border-b px-5 py-4">
          <div className="relative">
            <RiSearchLine className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search elements"
              className="pl-9"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-[28rem] overflow-y-auto px-5 py-4">
          {groups.length === 0 ? (
            <div className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              No elements match that search.
            </div>
          ) : null}
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.label}>
                <h3 className="mb-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                  {group.label}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <PickerItem key={item.key} item={item} onSelect={select} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PickerItem({
  item,
  onSelect,
}: {
  item: RegistryItem;
  onSelect: (type: RegistryKey) => void;
}) {
  const visual = getRegistryVisual(item.key);
  const Icon = visual?.icon;

  return (
    <button
      type="button"
      className="flex min-h-20 w-full items-start gap-3 rounded-lg border bg-background p-3 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      onClick={() => onSelect(item.key)}
    >
      <span
        className={twx(
          "flex size-9 shrink-0 items-center justify-center border",
          visual?.color ?? "bg-muted text-muted-foreground",
        )}
      >
        {Icon ? <Icon className="size-4" /> : <RiAddLine className="size-4" />}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{item.display}</span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
          {item.description}
        </span>
      </span>
    </button>
  );
}

function SubmitButtonEditorBlock({
  onDeselect,
  onSelect,
  onUpdate,
  selected,
  submit,
}: {
  onDeselect: () => void;
  onSelect: () => void;
  onUpdate: (updater: (submit: SubmitConfig) => SubmitConfig) => void;
  selected: boolean;
  submit?: FormInput["submit"];
}) {
  const [activeTab, setActiveTab] = useState<"edit" | "options">("edit");
  const label = submitLabel(submit);
  const size = submit?.size ?? "default";
  const variant = submit?.variant ?? "default";

  return (
    <section
      data-editor-row={submitEditorId}
      className="group/editor relative w-full px-3 py-1 sm:px-6"
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onKeyDown={(event) => handleKeyboardSelect(event, onSelect)}
      role="button"
      tabIndex={0}
    >
      <div className="mx-auto grid w-full max-w-[52rem] grid-cols-[2.25rem_minmax(0,48rem)] gap-2">
        <div aria-hidden />
        <div
          className={twx(
            "min-w-0 rounded-lg border border-transparent bg-background transition-[background-color,border-color,box-shadow]",
            selected ? "px-0 py-0" : "px-4 py-4",
            !selected && "group-focus-within/editor:bg-muted/25 group-hover/editor:bg-muted/25",
          )}
        >
          {selected ? (
            <div
              data-editor-settings
              className="overflow-hidden rounded-lg border bg-card shadow-sm"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/20 px-3 py-2">
                <EditorPanelTabs
                  activeTab={activeTab}
                  hasOptions
                  onEdit={() => setActiveTab("edit")}
                  onOptions={() => setActiveTab("options")}
                />
                <div className="flex items-center gap-2">
                  <div className="flex h-8 items-center gap-2 rounded-md border bg-background px-3 text-sm">
                    <span className="flex size-5 items-center justify-center border bg-muted text-muted-foreground">
                      <RiSendPlaneLine className="size-3.5" />
                    </span>
                    Submit button
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="size-8 rounded-full border bg-background p-0"
                    aria-label="Deselect submit button"
                    onClick={onDeselect}
                  >
                    <RiCloseLine className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                {activeTab === "edit" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="form-submit-label">
                      Button text
                    </label>
                    <Input
                      id="form-submit-label"
                      value={submit?.label ?? ""}
                      onChange={(event) =>
                        onUpdate((current) => ({
                          ...current,
                          label: event.target.value || undefined,
                        }))
                      }
                      placeholder="Submit"
                    />
                  </div>
                ) : (
                  <div className="-m-3 divide-y">
                    <div className="grid gap-3 px-3 py-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="form-submit-size">
                          Button width
                        </label>
                        <Select
                          value={size}
                          onValueChange={(value) =>
                            onUpdate((current) => ({
                              ...current,
                              size: value as SubmitConfig["size"],
                            }))
                          }
                        >
                          <SelectTrigger id="form-submit-size" className="w-full bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="full-width">Full width</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="form-submit-variant">
                          Button style
                        </label>
                        <Select
                          value={variant}
                          onValueChange={(value) =>
                            onUpdate((current) => ({
                              ...current,
                              variant: value as SubmitConfig["variant"],
                            }))
                          }
                        >
                          <SelectTrigger id="form-submit-variant" className="w-full bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Primary</SelectItem>
                            <SelectItem value="destructive">Destructive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                <RiSendPlaneLine className="size-4" />
                Submit button
              </div>
              <div
                className={twx("flex", size === "full-width" ? "justify-stretch" : "justify-end")}
              >
                <Button
                  type="button"
                  variant={submit?.variant}
                  className={twx(
                    "pointer-events-none font-semibold",
                    size === "full-width" ? "w-full" : "min-w-[120px]",
                  )}
                >
                  {label}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SortableEditorBlock({
  element,
  onAddAfter,
  onDeselect,
  onRemove,
  onSelect,
  onTransform,
  onUpdate,
  selected,
}: {
  element: EditorElement;
  onAddAfter: (type: RegistryKey) => void;
  onDeselect: () => void;
  onRemove: () => void;
  onSelect: () => void;
  onTransform: (type: string) => void;
  onUpdate: (updater: (element: EditorElement) => EditorElement) => void;
  selected: boolean;
}) {
  const item = getRegistryItem(element.type);
  const Editor = getRegistryEditor(element.type);
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: element.id });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 40 : undefined,
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    const target = event.target as HTMLElement;
    const shouldKeepSelected = Boolean(
      target.closest("input, textarea, button, [role='combobox'], [data-editor-settings]"),
    );

    if (selected && !shouldKeepSelected) {
      onDeselect();
      return;
    }

    onSelect();
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      data-editor-row={element.id}
      className={twx("group/editor relative w-full px-3 py-1 sm:px-6", isDragging && "z-40")}
      onClick={handleClick}
      onKeyDown={(event) => handleKeyboardSelect(event, onSelect)}
      role="button"
      tabIndex={0}
    >
      <div className="mx-auto grid w-full max-w-[52rem] grid-cols-[2.25rem_minmax(0,48rem)] gap-2">
        <div
          data-editor-actions={element.id}
          className={twx(
            "flex items-start justify-end opacity-0 transition-opacity group-focus-within/editor:opacity-100 group-hover/editor:opacity-100",
            selected && "opacity-100",
          )}
        >
          <div className="flex shrink-0 flex-col items-center gap-0.5 rounded-full border bg-background p-1 shadow-sm">
            <ElementPicker onSelect={onAddAfter} trigger="compact" />
            <Button
              ref={setActivatorNodeRef}
              type="button"
              variant="outline"
              size="sm"
              className="size-7 cursor-grab touch-none rounded-full border-0 bg-transparent p-0 active:cursor-grabbing"
              aria-label={`Drag ${item?.display ?? element.type}`}
              onClick={(event) => event.stopPropagation()}
              {...attributes}
              {...listeners}
            >
              <RiDraggable className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="size-7 rounded-full border-0 bg-transparent p-0 hover:text-destructive"
              aria-label={`Delete ${item?.display ?? element.type}`}
              onClick={(event) => {
                event.stopPropagation();
                onRemove();
              }}
            >
              <RiDeleteBinLine className="size-4" />
            </Button>
          </div>
        </div>

        <div
          className={twx(
            "min-w-0 rounded-lg border border-transparent bg-background transition-[background-color,border-color,box-shadow,transform]",
            selected ? "px-0 py-0" : "px-4 py-4",
            !selected &&
              !isDragging &&
              "group-focus-within/editor:bg-muted/25 group-hover/editor:bg-muted/25",
            isDragging && "border-ring/40 bg-background shadow-lg ring-2 ring-ring/20",
          )}
        >
          {Editor ? (
            <Editor
              element={element}
              onChange={(next) => onUpdate(() => next)}
              onDeselect={onDeselect}
              onSelect={onSelect}
              onTransform={onTransform}
              selected={selected}
              transformOptions={transformOptions}
            />
          ) : (
            <div className="text-sm text-muted-foreground">{labelForElement(element)}</div>
          )}
        </div>
      </div>
    </section>
  );
}

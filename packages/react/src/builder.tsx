"use client";

import { DEFAULT_FORM_NAME, type FormInput } from "@formbro/core/schema/form";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Registry, type RegistryKey } from "@formbro/core/registry";
import {
  convertFormElementDraftType,
  createFormElementDraft,
  createFormElementId,
} from "@formbro/core/schema/editor";
import { twx } from "@formbro/shared/twx";
import { Input } from "@formbro/ui/input";
import { useEffect, useMemo, useState } from "react";
import {
  submitEditorId,
  updateSubmitConfig,
  type EditorElement,
  type SubmitConfig,
} from "./builder/canvas-utils";
import { ElementPicker } from "./builder/element-picker";
import { SortableEditorBlock } from "./builder/sortable-editor-block";
import { SubmitButtonEditorBlock } from "./builder/submit-button-editor-block";

type FormBuilderDensity = "compact" | "default";

export function FormBuilderCanvas({
  schema,
  onSchemaChange,
  className,
  density = "default",
}: {
  schema: FormInput;
  onSchemaChange: (updater: (schema: FormInput) => FormInput) => void;
  className?: string;
  density?: FormBuilderDensity;
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
    const id = createFormElementId({ elements: schema.elements, type });
    const element = createFormElementDraft({ id, type });

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
    if (!(type in Registry)) return;
    const nextType = type as RegistryKey;

    onSchemaChange((current) => {
      const elements = current.elements.map((element) =>
        element.id === elementId
          ? convertFormElementDraftType({ element, type: nextType })
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
    onSchemaChange((current) => ({ ...current, name: name || DEFAULT_FORM_NAME }));
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
      className={twx(
        "w-full",
        density === "compact" ? "py-4 lg:py-5" : "py-12 lg:py-16",
        className,
      )}
      onClick={() => setSelectedElementId(null)}
      role="presentation"
    >
      <FormTitle density={density} value={schema.name} onChange={updateFormName} />
      {schema.elements.length === 0 ? (
        <BlankForm density={density} onAdd={(type) => addElement(0, type)} />
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
                density={density}
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
        density={density}
      />
    </div>
  );
}

function FormTitle({
  density,
  onChange,
  value,
}: {
  density: FormBuilderDensity;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[52rem] grid-cols-[2.25rem_minmax(0,48rem)] gap-2 px-3 sm:px-6">
      <div aria-hidden />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onClick={(event) => event.stopPropagation()}
        className={twx(
          "h-auto rounded-none border-0 bg-transparent px-0 py-0 font-display font-bold tracking-tight shadow-none focus-visible:ring-0 dark:bg-transparent",
          density === "compact" ? "mb-4 text-3xl md:text-4xl" : "mb-10 text-4xl md:text-5xl",
        )}
        aria-label="Form title"
      />
    </div>
  );
}

function BlankForm({
  density,
  onAdd,
}: {
  density: FormBuilderDensity;
  onAdd: (type: RegistryKey) => void;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[52rem] grid-cols-[2.25rem_minmax(0,48rem)] gap-2 px-3 sm:px-6">
      <div aria-hidden />
      <div
        className={twx(
          "rounded-lg border border-dashed text-center",
          density === "compact" ? "my-4 px-4 py-8" : "my-8 px-6 py-12",
        )}
      >
        <h2 className="font-display text-xl font-bold tracking-tight">Blank form</h2>
        <p className="mt-2 text-sm text-muted-foreground">No elements yet.</p>
        <div className="mt-5 flex justify-center">
          <ElementPicker onSelect={onAdd} trigger="empty" />
        </div>
      </div>
    </div>
  );
}

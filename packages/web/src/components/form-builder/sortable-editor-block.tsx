"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Registry, type RegistryKey } from "@formbro/core/registry";
import { getRegistryEditorPreview, labelForFormElement } from "@formbro/core/schema/editor";
import { twx } from "@formbro/shared/twx";
import { Button } from "@formbro/ui/button";
import { RiDeleteBinLine, RiDraggable } from "@remixicon/react";
import { handleKeyboardSelect, type EditorElement } from "./canvas-utils";
import { ElementPicker } from "./element-picker";
import { editorTransformOptions, getRegistryEditor, getRegistryVisual } from "./registry";

export function SortableEditorBlock({
  density = "default",
  element,
  onAddAfter,
  onDeselect,
  onRemove,
  onSelect,
  onTransform,
  onUpdate,
  selected,
}: {
  density?: "compact" | "default";
  element: EditorElement;
  onAddAfter: (type: RegistryKey) => void;
  onDeselect: () => void;
  onRemove: () => void;
  onSelect: () => void;
  onTransform: (type: string) => void;
  onUpdate: (updater: (element: EditorElement) => EditorElement) => void;
  selected: boolean;
}) {
  const item = Registry[element.type as RegistryKey];
  const visual = getRegistryVisual(element.type);
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
  const compactPreviewSpacing =
    !selected && getRegistryEditorPreview(element.type)?.spacing === "compact";

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
      className={twx(
        "group/editor relative w-full px-3 sm:px-6",
        density === "compact" ? "py-0.5" : "py-1",
        isDragging && "z-40",
      )}
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
            selected
              ? "px-0 py-0"
              : compactPreviewSpacing
                ? density === "compact"
                  ? "px-3 py-0.5"
                  : "px-4 py-1"
                : density === "compact"
                  ? "px-3 py-2"
                  : "px-4 py-4",
            compactPreviewSpacing &&
              getRegistryEditorPreview(element.type)?.align === "center" &&
              "flex items-center",
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
              transformOptions={editorTransformOptions}
            />
          ) : (
            <div className="text-sm text-muted-foreground">{labelForFormElement(element)}</div>
          )}
        </div>
      </div>
    </section>
  );
}

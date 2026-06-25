import { Input } from "@formbro/ui/input";
import { RiPageSeparator } from "@remixicon/react";
import {
  EditorPanel,
  EditorPropertyField,
  setFormElementInputValue,
  type EditorElement,
  type EditorProps,
} from "../editor";

export const icon = RiPageSeparator;
export const color = "bg-gray-100 text-gray-600";

export function component() {
  return null;
}

type PageBreakEditorElement = EditorElement & {
  label?: string | boolean;
  type: "page_break";
};

function pageTitleForElement(element: PageBreakEditorElement) {
  return typeof element.label === "string" ? element.label : "";
}

export function editor({
  element,
  onChange,
  onDeselect,
  onSelect,
  onTransform,
  selected,
  transformOptions,
}: EditorProps<PageBreakEditorElement>) {
  const pageTitle = pageTitleForElement(element);

  if (selected) {
    return (
      <EditorPanel
        element={element}
        onChange={onChange}
        onDeselect={onDeselect}
        onSelect={onSelect}
        onTransform={onTransform}
        properties={[]}
        selected={selected}
        transformOptions={transformOptions}
      >
        <EditorPropertyField label="Page title" htmlFor={`${element.id}-label`}>
          <Input
            id={`${element.id}-label`}
            value={pageTitle}
            onChange={(event) => {
              const value = event.target.value;
              onChange({
                ...setFormElementInputValue(element, "label", value || undefined),
                name: value || "Page Break",
              });
            }}
            placeholder="Optional page title"
          />
        </EditorPropertyField>
      </EditorPanel>
    );
  }

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

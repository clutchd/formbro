import type { FormLabel } from "@formbro/core/schema/label";
import { FieldDescription } from "@formbro/ui/field";
import { Textarea } from "@formbro/ui/textarea";
import { RiAlignLeft } from "@remixicon/react";
import * as React from "react";
import {
  EditorPanel,
  EditorPropertyField,
  editorLabelForElement,
  setEditorElementValue,
  type EditorElement,
  type EditorProps,
} from "../editor";

export const icon = RiAlignLeft;
export const color = "bg-slate-100 text-slate-600";

export function component({ label }: { label?: FormLabel }) {
  if (!label) return null;
  return <FieldDescription className="leading-relaxed">{label}</FieldDescription>;
}

type DescriptionEditorElement = EditorElement & {
  label?: FormLabel;
  type: "description";
};

export function editor({
  element,
  onChange,
  onDeselect,
  onSelect,
  onTransform,
  selected,
  transformOptions,
}: EditorProps<DescriptionEditorElement>) {
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
        <EditorPropertyField label="Description text" htmlFor={`${element.id}-label`}>
          <Textarea
            id={`${element.id}-label`}
            value={editorLabelForElement(element)}
            onChange={(event) =>
              onChange({
                ...setEditorElementValue(element, "label", event.target.value),
                name: event.target.value || element.name,
              })
            }
            placeholder="Description"
            className="min-h-24 resize-none"
          />
        </EditorPropertyField>
      </EditorPanel>
    );
  }

  return (
    <>
      <Textarea
        value={editorLabelForElement(element)}
        onFocus={onSelect}
        onChange={(event) =>
          onChange({
            ...setEditorElementValue(element, "label", event.target.value),
            name: event.target.value || element.name,
          })
        }
        aria-label="Description text"
        className="min-h-20 resize-none rounded-none border-0 bg-transparent px-0 py-0 leading-7 text-muted-foreground shadow-none focus-visible:outline-none"
        placeholder="Description"
      />
    </>
  );
}

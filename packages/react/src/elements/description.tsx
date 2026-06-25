import type { FormLabel } from "@formbro/core/schema/label";
import { FieldDescription } from "@formbro/ui/field";
import { Textarea } from "@formbro/ui/textarea";
import { RiAlignLeft } from "@remixicon/react";
import {
  EditorPanel,
  EditorPropertyField,
  editorLabelForElement,
  setFormElementInputValue,
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
  const value = editorLabelForElement(element);

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
            value={value}
            onChange={(event) =>
              onChange({
                ...setFormElementInputValue(element, "label", event.target.value),
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
        value={value}
        rows={Math.max(1, value.split("\n").length)}
        onFocus={onSelect}
        onChange={(event) =>
          onChange({
            ...setFormElementInputValue(element, "label", event.target.value),
            name: event.target.value || element.name,
          })
        }
        aria-label="Description text"
        className="min-h-0 resize-none overflow-hidden rounded-none border-0 bg-transparent px-0 py-0 text-sm leading-relaxed text-muted-foreground shadow-none focus-visible:outline-none"
        placeholder="Description"
      />
    </>
  );
}

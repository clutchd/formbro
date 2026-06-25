import type { FormLabel } from "@formbro/core/schema/label";
import { FieldSeparator } from "@formbro/ui/field";
import { Input } from "@formbro/ui/input";
import { RiSeparator } from "@remixicon/react";
import {
  EditorInlineTextInput,
  EditorPanel,
  EditorPropertyField,
  setFormElementInputValue,
  type EditorElement,
  type EditorProps,
} from "../editor";

export const icon = RiSeparator;
export const color = "bg-gray-100 text-gray-600";

export function component({ label }: { label?: FormLabel }) {
  if (!label) return <FieldSeparator />;
  return <FieldSeparator>{label}</FieldSeparator>;
}

type DividerEditorElement = EditorElement & {
  label?: FormLabel;
  type: "divider";
};

export function editor({
  element,
  onChange,
  onDeselect,
  onSelect,
  onTransform,
  selected,
  transformOptions,
}: EditorProps<DividerEditorElement>) {
  const label = "label" in element && typeof element.label === "string" ? element.label : "";

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
        <EditorPropertyField label="Divider label" htmlFor={`${element.id}-label`}>
          <Input
            id={`${element.id}-label`}
            value={label}
            onChange={(event) =>
              onChange(setFormElementInputValue(element, "label", event.target.value))
            }
            placeholder="Optional divider label"
          />
        </EditorPropertyField>
      </EditorPanel>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="h-px bg-border" />
        {selected || label ? (
          <EditorInlineTextInput
            value={label}
            placeholder="Divider label"
            ariaLabel="Divider label"
            className="text-center text-sm text-muted-foreground"
            onFocus={onSelect}
            onChange={(value) => onChange(setFormElementInputValue(element, "label", value))}
          />
        ) : null}
      </div>
    </>
  );
}

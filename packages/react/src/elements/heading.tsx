import type { FormLabel } from "@formbro/core/schema/label";
import { twx } from "@formbro/shared/twx";
import { FieldLegend } from "@formbro/ui/field";
import { Input } from "@formbro/ui/input";
import { RiHeading } from "@remixicon/react";
import {
  EditorInlineTextInput,
  EditorPanel,
  EditorPropertyField,
  editorLabelForElement,
  setFormElementInputValue,
  type EditorElement,
  type EditorProps,
} from "../editor";

export const icon = RiHeading;
export const color = "bg-purple-100 text-purple-600";

export function component({ level = 2, label }: { level?: 1 | 2 | 3; label?: FormLabel }) {
  if (!label) return null;

  let fontSize: string;
  switch (level) {
    case 1:
      fontSize = "!text-2xl";
      break;
    case 2:
      fontSize = "!text-xl";
      break;
    case 3:
      fontSize = "!text-lg";
      break;
  }

  return (
    <FieldLegend
      className={twx("pt-4 font-display font-bold tracking-tight text-foreground", fontSize)}
    >
      {label}
    </FieldLegend>
  );
}

type HeadingEditorElement = EditorElement & {
  label?: FormLabel;
  level?: 1 | 2 | 3;
  type: "heading";
};

export function editor({
  element,
  onChange,
  onDeselect,
  onSelect,
  onTransform,
  selected,
  transformOptions,
}: EditorProps<HeadingEditorElement>) {
  if (selected) {
    return (
      <EditorPanel
        element={element}
        onChange={onChange}
        onDeselect={onDeselect}
        onSelect={onSelect}
        onTransform={onTransform}
        properties={["level"]}
        selected={selected}
        transformOptions={transformOptions}
      >
        <EditorPropertyField label="Heading text" htmlFor={`${element.id}-label`}>
          <Input
            id={`${element.id}-label`}
            value={editorLabelForElement(element)}
            onChange={(event) => {
              const value = event.target.value;
              onChange({
                ...setFormElementInputValue(element, "label", value),
                name: value || element.name,
              });
            }}
            placeholder="Heading"
            className="font-display text-lg font-bold tracking-tight"
          />
        </EditorPropertyField>
      </EditorPanel>
    );
  }

  return (
    <>
      <EditorInlineTextInput
        value={editorLabelForElement(element)}
        placeholder="Heading"
        ariaLabel="Heading text"
        className={twx(
          "font-display font-bold tracking-tight text-foreground",
          element.level === 1 && "text-2xl md:text-2xl",
          (element.level ?? 2) === 2 && "text-xl md:text-xl",
          element.level === 3 && "text-lg md:text-lg",
        )}
        onFocus={onSelect}
        onChange={(value) =>
          onChange({
            ...setFormElementInputValue(element, "label", value),
            name: value || element.name,
          })
        }
      />
    </>
  );
}

import type * as React from "react";
import {
  ElementRegistry,
  FieldRegistry,
  Registry,
  type RegistryItem,
  type RegistryKey,
} from "@formbro/core/registry";
import { getRegistryEditorMetadata, getRegistryRules } from "@formbro/core/schema/editor";
import {
  RiAlignLeft,
  RiHashtag,
  RiHeading,
  RiInputField,
  RiLinkM,
  RiListCheck,
  RiMailLine,
  RiPageSeparator,
  RiSeparator,
  RiText,
} from "@remixicon/react";
import { RegistryElementEditor, type EditorProps, type EditorTransformOption } from "./editor";

type RegistryVisual = {
  color: string;
  icon: React.ComponentType<{ className?: string }>;
};
type RegistryEditor = (props: EditorProps) => React.ReactNode;

const RegistryVisuals = {
  description: { color: "bg-slate-100 text-slate-600", icon: RiAlignLeft },
  divider: { color: "bg-gray-100 text-gray-600", icon: RiSeparator },
  email: { color: "bg-blue-100 text-blue-600", icon: RiMailLine },
  heading: { color: "bg-purple-100 text-purple-600", icon: RiHeading },
  link: { color: "bg-cyan-100 text-cyan-600", icon: RiLinkM },
  long_text: { color: "bg-orange-100 text-orange-600", icon: RiText },
  number: { color: "bg-blue-100 text-blue-600", icon: RiHashtag },
  page_break: { color: "bg-gray-100 text-gray-600", icon: RiPageSeparator },
  short_text: { color: "bg-rose-100 text-rose-600", icon: RiInputField },
  single_select: { color: "bg-emerald-100 text-emerald-600", icon: RiListCheck },
} as const satisfies Record<RegistryKey, RegistryVisual>;

export const registryItems = [...ElementRegistry, ...FieldRegistry] as RegistryItem[];

export function getRegistryVisual(type: string): RegistryVisual | null {
  return type in RegistryVisuals ? RegistryVisuals[type as RegistryKey] : null;
}

export function getRegistryEditor(type: string): RegistryEditor | null {
  if (!(type in Registry)) return null;
  return getRegistryEditorMetadata(type as RegistryKey) ? RegistryElementEditor : null;
}

export const editorTransformOptions: EditorTransformOption[] = registryItems.map((item) => {
  const visual = getRegistryVisual(item.key);

  return {
    color: visual?.color,
    icon: visual?.icon,
    key: item.key as RegistryKey,
    label: item.display,
    rules: getRegistryRules(item),
  };
});

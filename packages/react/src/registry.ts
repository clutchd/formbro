import type * as React from "react";
import {
  ElementRegistry,
  FieldRegistry,
  Registry,
  type ElementRegistryKey,
  type FieldRegistryKey,
  type RegistryItem,
  type RegistryKey,
} from "@formbro/core/registry";
import { getRegistryEditorMetadata, getRegistryRules } from "@formbro/core/schema/editor";
import { RegistryElementEditor, type EditorProps, type EditorTransformOption } from "./editor";
import * as date from "./elements/date";
import * as description from "./elements/description";
import * as divider from "./elements/divider";
import * as email from "./elements/email";
import * as heading from "./elements/heading";
import * as link from "./elements/link";
import * as long_text from "./elements/long-text";
import * as multi_select from "./elements/multi-select";
import * as number from "./elements/number";
import * as page_break from "./elements/page-break";
import * as radio_group from "./elements/radio-group";
import * as short_text from "./elements/short-text";
import * as single_select from "./elements/single-select";

export const ElementComponents = {
  description: description,
  divider: divider,
  heading: heading,
  page_break: page_break,
} as const;

export const FieldComponents = {
  date: date,
  email: email,
  link: link,
  long_text: long_text,
  multi_select: multi_select,
  number: number,
  radio_group: radio_group,
  single_select: single_select,
  short_text: short_text,
} as const;

type RegistryComponentModule =
  | (typeof ElementComponents)[ElementRegistryKey]
  | (typeof FieldComponents)[FieldRegistryKey];
type RegistryEditor = (props: EditorProps) => React.ReactNode;

export const registryItems = [...ElementRegistry, ...FieldRegistry] as RegistryItem[];

export function getRegistryVisual(type: string): RegistryComponentModule | null {
  if (type in ElementComponents) {
    return ElementComponents[type as ElementRegistryKey];
  }

  if (type in FieldComponents) {
    return FieldComponents[type as FieldRegistryKey];
  }

  return null;
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

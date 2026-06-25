import type { CompiledElement } from "@formbro/core/compile";
import type * as React from "react";
import {
  ElementRegistry,
  FieldRegistry,
  type ElementRegistryKey,
  type FieldRegistryKey,
  type RegistryItem,
} from "@formbro/core/registry";
import type { FieldComponentProps } from "./types.js";
import * as description from "./elements/description.js";
import * as divider from "./elements/divider.js";
import * as email from "./elements/email.js";
import * as heading from "./elements/heading.js";
import * as link from "./elements/link.js";
import * as long_text from "./elements/long-text.js";
import * as number from "./elements/number.js";
import * as page_break from "./elements/page-break.js";
import * as short_text from "./elements/short-text.js";
import * as single_select from "./elements/single-select.js";

export type ElementComponent = (props: CompiledElement) => React.ReactNode;
export type FieldComponent = (props: FieldComponentProps) => React.ReactNode;

type ElementComponentModule = {
  component: ElementComponent;
};
type FieldComponentModule = {
  component: FieldComponent;
};

export const ElementComponents = {
  description: description,
  divider: divider,
  heading: heading,
  page_break: page_break,
} as const;

export const FieldComponents = {
  email: email,
  link: link,
  long_text: long_text,
  number: number,
  single_select: single_select,
  short_text: short_text,
} as const satisfies Record<FieldRegistryKey, FieldComponentModule>;

export const registryItems = [...ElementRegistry, ...FieldRegistry] as RegistryItem[];

export function getElementComponent(type: string): ElementComponent | null {
  if (type in ElementComponents) {
    return ElementComponents[type as ElementRegistryKey].component;
  }

  return null;
}

export function getFieldComponent(type: string): FieldComponent | null {
  if (type in FieldComponents) {
    return FieldComponents[type as FieldRegistryKey].component;
  }

  return null;
}

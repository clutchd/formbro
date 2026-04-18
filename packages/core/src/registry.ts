import { z } from "zod";
import type { FormRegistryElement, FormRegistryField } from "./schema/registry";

function element<const TElement extends FormRegistryElement>(element: TElement) {
  return {
    ...element,
    category: "element" as const,
  };
}

function elements<const TElements extends readonly [FormRegistryElement, ...FormRegistryElement[]]>(
  elements: TElements,
) {
  return elements;
}

const description = element({
  key: "description",
  display: "Description",
  description: "A text description or helper text element",
  schema: z.object({
    label: z.string(),
  }),
});

const divider = element({
  key: "divider",
  display: "Divider",
  description: "A visual divider to separate sections of the form",
  schema: z.object({
    label: z.string().optional(),
  }),
});

const heading = element({
  key: "heading",
  display: "Heading",
  description: "Heading element for section titles",
  schema: z.object({
    label: z.string(),
    level: z
      .union([z.literal(1), z.literal(2), z.literal(3)])
      .optional()
      .default(1),
  }),
});

const page_break = element({
  key: "page_break",
  display: "Page Break",
  description: "Splits the form into multiple pages. Invisible divider.",
  schema: z.object({
    label: z.string().optional(),
  }),
});

function field<const TField extends FormRegistryField>(field: TField) {
  return {
    ...field,
    category: "field" as const,
  };
}

function fields<const TFields extends readonly [FormRegistryField, ...FormRegistryField[]]>(
  fields: TFields,
) {
  return fields;
}

const email = field({
  key: "email",
  display: "Email",
  description: "Email input for email addresses",
  rules: ["required"],
  schema: z.email(),
});

const link = field({
  key: "link",
  display: "Link",
  description: "Link input for web addresses, URLs, or references",
  rules: ["required"],
  schema: z.url(),
});

const long_text = field({
  key: "long_text",
  display: "Long Text",
  description: "Multi-line textarea for longer text responses, comments, and more",
  rules: ["required", "min", "max", "regex"],
  schema: z.string(),
});

const number = field({
  key: "number",
  display: "Number",
  description: "Number input for numeric values",
  rules: ["required", "min", "max"],
  schema: z.union([z.number(), z.literal("")]),
});

const short_text = field({
  key: "short_text",
  display: "Short Text",
  description: "Single-line text input for names and short responses.",
  schema: z.string(),
  rules: ["required", "min", "max", "regex"],
  // builder: {
  //   fields: [
  //     { key: "label", label: "Label", control: "text" },
  //     { key: "description", label: "Description", control: "textarea" },
  //     { key: "placeholder", label: "Placeholder", control: "text" },
  //   ],
  // }},
});

const single_select = field({
  key: "single_select",
  display: "Single Select",
  description: "Dropdown selection for a single choice",
  rules: ["required"],
  schema: z.string(),
});

export const ElementRegistry = elements([description, divider, heading, page_break]);
export const FieldRegistry = fields([email, link, long_text, number, short_text, single_select]);
export const Registry = Object.fromEntries(
  [...ElementRegistry, ...FieldRegistry].map((item) => [item.key, item]),
);

export type RegistryKey = (typeof Registry)[number]["key"];
export const RegistryKeys = Object.keys(Registry);

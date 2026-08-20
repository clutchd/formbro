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
  editor: {
    defaults: {
      label: "Add helpful context for this section.",
    },
    preview: {
      control: "description",
      placeholder: "Description",
      spacing: "compact",
    },
    properties: [
      {
        key: "label",
        label: "Description text",
        control: "textarea",
        placeholder: "Description",
        section: "content",
        span: "full",
      },
    ],
  },
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
  editor: {
    preview: {
      control: "divider",
    },
    properties: [
      {
        key: "label",
        label: "Divider label",
        control: "text",
        placeholder: "Optional divider label",
        section: "content",
      },
    ],
  },
});

const heading = element({
  key: "heading",
  display: "Heading",
  description: "Heading element for section titles",
  editor: {
    defaults: {
      label: "New heading",
      level: 2,
    },
    preview: {
      control: "heading",
      placeholder: "Heading",
      align: "center",
      spacing: "compact",
    },
    properties: [
      {
        key: "label",
        label: "Heading text",
        control: "text",
        placeholder: "Heading",
        section: "content",
        span: "full",
      },
      {
        key: "level",
        label: "Size",
        control: "select",
        options: [
          { label: "Large", value: "1" },
          { label: "Medium", value: "2" },
          { label: "Small", value: "3" },
        ],
        section: "content",
      },
    ],
  },
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
  editor: {
    preview: {
      control: "page_break",
    },
    properties: [
      {
        key: "label",
        label: "Page title",
        control: "text",
        placeholder: "Optional page title",
        section: "content",
      },
    ],
  },
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

const date = field({
  key: "date",
  display: "Date",
  description: "Date input for start dates, event days, and establishment dates",
  editor: {
    defaults: {
      label: "Date",
    },
    preview: {
      control: "input",
      inputType: "date",
    },
    properties: [
      { key: "label", label: "Question", control: "text", placeholder: "Question" },
      {
        key: "description",
        label: "Helper text",
        control: "text",
        placeholder: "Optional helper text",
      },
      { key: "required", label: "Required", control: "rule", section: "validation" },
    ],
  },
  rules: ["required"],
  schema: z.iso.date(),
});

const email = field({
  key: "email",
  display: "Email",
  description: "Email input for email addresses",
  editor: {
    defaults: {
      label: "Email",
      placeholder: "you@example.com",
    },
    preview: {
      control: "input",
      inputType: "email",
      placeholder: "name@example.com",
    },
    properties: [
      { key: "label", label: "Question", control: "text", placeholder: "Question" },
      {
        key: "description",
        label: "Helper text",
        control: "text",
        placeholder: "Optional helper text",
      },
      {
        key: "placeholder",
        label: "Placeholder",
        control: "text",
        placeholder: "Input placeholder",
      },
      { key: "required", label: "Required", control: "rule", section: "validation" },
    ],
  },
  rules: ["required"],
  schema: z.email(),
});

const link = field({
  key: "link",
  display: "Link",
  description: "Link input for web addresses, URLs, or references",
  editor: {
    defaults: {
      label: "Link",
      placeholder: "https://example.com",
    },
    preview: {
      control: "input",
      inputType: "url",
      placeholder: "https://example.com",
    },
    properties: [
      { key: "label", label: "Question", control: "text", placeholder: "Question" },
      {
        key: "description",
        label: "Helper text",
        control: "text",
        placeholder: "Optional helper text",
      },
      {
        key: "placeholder",
        label: "Placeholder",
        control: "text",
        placeholder: "Input placeholder",
      },
      { key: "required", label: "Required", control: "rule", section: "validation" },
    ],
  },
  rules: ["required"],
  schema: z.url(),
});

const long_text = field({
  key: "long_text",
  display: "Long Text",
  description: "Multi-line textarea for longer text responses, comments, and more",
  editor: {
    defaults: {
      label: "Long answer",
      placeholder: "Share more detail",
    },
    preview: {
      control: "textarea",
      placeholder: "Long answer",
    },
    properties: [
      { key: "label", label: "Question", control: "text", placeholder: "Question" },
      {
        key: "description",
        label: "Helper text",
        control: "text",
        placeholder: "Optional helper text",
      },
      {
        key: "placeholder",
        label: "Placeholder",
        control: "text",
        placeholder: "Input placeholder",
      },
      { key: "required", label: "Required", control: "rule", section: "validation" },
      {
        key: "min",
        label: "Min characters",
        control: "rule",
        defaultValue: 1,
        inputType: "number",
        section: "validation",
      },
      {
        key: "max",
        label: "Max characters",
        control: "rule",
        defaultValue: 240,
        inputType: "number",
        section: "validation",
      },
    ],
  },
  rules: ["required", "min", "max", "regex"],
  schema: z.string(),
});

const number = field({
  key: "number",
  display: "Number",
  description: "Number input for numeric values",
  editor: {
    defaults: {
      label: "Number",
      placeholder: "0",
    },
    preview: {
      control: "input",
      inputType: "number",
      placeholder: "0",
    },
    properties: [
      { key: "label", label: "Question", control: "text", placeholder: "Question" },
      {
        key: "description",
        label: "Helper text",
        control: "text",
        placeholder: "Optional helper text",
      },
      {
        key: "placeholder",
        label: "Placeholder",
        control: "text",
        placeholder: "Input placeholder",
      },
      { key: "required", label: "Required", control: "rule", section: "validation" },
      {
        key: "min",
        label: "Minimum value",
        control: "rule",
        defaultValue: 0,
        inputType: "number",
        section: "validation",
      },
      {
        key: "max",
        label: "Maximum value",
        control: "rule",
        defaultValue: 100,
        inputType: "number",
        section: "validation",
      },
    ],
  },
  rules: ["required", "min", "max"],
  schema: z.union([z.number(), z.literal("")]),
});

const phone = field({
  key: "phone",
  display: "Phone",
  description: "Telephone input for local and international phone numbers",
  editor: {
    defaults: {
      label: "Phone",
      placeholder: "+1 555 123 4567",
    },
    preview: {
      control: "input",
      inputType: "tel",
      placeholder: "+1 555 123 4567",
    },
    properties: [
      { key: "label", label: "Question", control: "text", placeholder: "Question" },
      {
        key: "description",
        label: "Helper text",
        control: "text",
        placeholder: "Optional helper text",
      },
      {
        key: "placeholder",
        label: "Placeholder",
        control: "text",
        placeholder: "Input placeholder",
      },
      { key: "required", label: "Required", control: "rule", section: "validation" },
    ],
  },
  rules: ["required"],
  schema: z.string().trim(),
});

const short_text = field({
  key: "short_text",
  display: "Short Text",
  description: "Single-line text input for names and short responses.",
  editor: {
    defaults: {
      label: "Short answer",
      placeholder: "Type your answer",
    },
    preview: {
      control: "input",
      inputType: "text",
      placeholder: "Type your answer",
    },
    properties: [
      { key: "label", label: "Question", control: "text", placeholder: "Question" },
      {
        key: "description",
        label: "Helper text",
        control: "text",
        placeholder: "Optional helper text",
      },
      {
        key: "placeholder",
        label: "Placeholder",
        control: "text",
        placeholder: "Input placeholder",
      },
      { key: "required", label: "Required", control: "rule", section: "validation" },
      {
        key: "min",
        label: "Min characters",
        control: "rule",
        defaultValue: 1,
        inputType: "number",
        section: "validation",
      },
      {
        key: "max",
        label: "Max characters",
        control: "rule",
        defaultValue: 240,
        inputType: "number",
        section: "validation",
      },
    ],
  },
  schema: z.string(),
  rules: ["required", "min", "max", "regex"],
});

const single_select = field({
  key: "single_select",
  display: "Single Select",
  description: "Dropdown selection for a single choice",
  editor: {
    defaults: {
      label: "Choose one",
      options: ["Option 1", "Option 2", "Option 3"],
      placeholder: "Select an option",
    },
    preview: {
      control: "select",
      placeholder: "Select an option",
    },
    properties: [
      { key: "label", label: "Question", control: "text", placeholder: "Question" },
      {
        key: "description",
        label: "Helper text",
        control: "text",
        placeholder: "Optional helper text",
      },
      {
        key: "placeholder",
        label: "Placeholder",
        control: "text",
        placeholder: "Input placeholder",
      },
      {
        key: "options",
        label: "Options",
        control: "options",
        placeholder: "Option 1\nOption 2\nOption 3",
        section: "content",
        span: "full",
      },
      { key: "required", label: "Required", control: "rule", section: "validation" },
    ],
  },
  rules: ["required"],
  schema: z.string(),
});

const multi_select = field({
  key: "multi_select",
  display: "Multi Select",
  description: "Visible checkbox options for selecting multiple choices",
  default: [],
  editor: {
    defaults: {
      label: "Choose one or more",
      options: ["Option 1", "Option 2", "Option 3"],
    },
    preview: {
      control: "multi_select",
    },
    properties: [
      { key: "label", label: "Question", control: "text", placeholder: "Question" },
      {
        key: "description",
        label: "Helper text",
        control: "text",
        placeholder: "Optional helper text",
      },
      {
        key: "options",
        label: "Options",
        control: "options",
        placeholder: "Option 1\nOption 2\nOption 3",
        section: "content",
        span: "full",
      },
      { key: "required", label: "Required", control: "rule", section: "validation" },
    ],
  },
  rules: ["required"],
  schema: z.array(z.string()),
});

const radio_group = field({
  key: "radio_group",
  display: "Radio Group",
  description: "Visible radio options for selecting a single choice",
  editor: {
    defaults: {
      label: "Choose one",
      options: ["Option 1", "Option 2", "Option 3"],
    },
    preview: {
      control: "radio_group",
    },
    properties: [
      { key: "label", label: "Question", control: "text", placeholder: "Question" },
      {
        key: "description",
        label: "Helper text",
        control: "text",
        placeholder: "Optional helper text",
      },
      {
        key: "options",
        label: "Options",
        control: "options",
        placeholder: "Option 1\nOption 2\nOption 3",
        section: "content",
        span: "full",
      },
      { key: "required", label: "Required", control: "rule", section: "validation" },
    ],
  },
  rules: ["required"],
  schema: z.string(),
});

export const ElementRegistry = elements([description, divider, heading, page_break]);
export const FieldRegistry = fields([
  date,
  email,
  link,
  long_text,
  number,
  phone,
  short_text,
  single_select,
  multi_select,
  radio_group,
]);
export type ElementRegistryItem = (typeof ElementRegistry)[number];
export type FieldRegistryItem = (typeof FieldRegistry)[number];
export type RegistryItem = ElementRegistryItem | FieldRegistryItem;
export type ElementRegistryKey = ElementRegistryItem["key"];
export type FieldRegistryKey = FieldRegistryItem["key"];
export type RegistryKey = RegistryItem["key"];

export const Registry = Object.fromEntries(
  [...ElementRegistry, ...FieldRegistry].map((item) => [item.key, item]),
) as {
  [Key in RegistryKey]: Extract<RegistryItem, { key: Key }>;
};

export const RegistryKeys = Object.keys(Registry) as [RegistryKey, ...RegistryKey[]];

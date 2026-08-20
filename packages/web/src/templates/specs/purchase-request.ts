import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "purchase_request",
  version: 1,
  description: "Request an item with quantity, estimate, and why it is needed.",
  category: "request",
  categories: ["request", "order-form"],
  tags: ["procurement", "finance"],
  schema: {
    id: "purchase_request",
    name: "Purchase Request",
    elements: [
      {
        id: "purchase_request_heading",
        name: "Purchase request",
        type: "heading",
        label: "Purchase request",
        level: 1,
      },
      {
        id: "purchase_request_intro",
        name: "Purchase request intro",
        type: "description",
        label: "Enough detail for a manager to approve or send back.",
      },
      {
        id: "item",
        name: "Item or service",
        type: "short_text",
        label: "Item or service",
        placeholder: "Replacement dock seals",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "quantity",
        name: "Quantity",
        type: "number",
        label: "Quantity",
        placeholder: "2",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "estimate",
        name: "Estimated cost",
        type: "number",
        label: "Estimated cost",
        placeholder: "480",
      },
      {
        id: "vendor",
        name: "Preferred vendor",
        type: "short_text",
        label: "Preferred vendor",
        placeholder: "Optional",
      },
      {
        id: "reason",
        name: "Why is this needed?",
        type: "long_text",
        label: "Why is this needed?",
        placeholder: "What breaks if we wait.",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
    ],
    submit: {
      label: "Submit request",
      size: "full-width",
    },
  },
};

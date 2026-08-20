import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "quote_request",
  version: 1,
  description: "Collect scope, timeline, and budget so a quote can go out quickly.",
  category: "request",
  categories: ["request", "order-form"],
  tags: ["sales", "quotes"],
  schema: {
    id: "quote_request",
    name: "Quote Request",
    elements: [
      {
        id: "quote_request_heading",
        name: "Request a quote",
        type: "heading",
        label: "Request a quote",
        level: 1,
      },
      {
        id: "quote_request_intro",
        name: "Request a quote intro",
        type: "description",
        label: "A short scope is enough for a first pass.",
      },
      {
        id: "contact_name",
        name: "Your name",
        type: "short_text",
        label: "Your name",
        placeholder: "Taylor Morgan",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "contact_email",
        name: "Email",
        type: "email",
        label: "Email",
        placeholder: "you@example.com",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "company",
        name: "Company",
        type: "short_text",
        label: "Company",
        placeholder: "Acme Operations",
      },
      {
        id: "scope",
        name: "Scope",
        type: "long_text",
        label: "Scope",
        placeholder: "What should we price?",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "timeline",
        name: "Timeline",
        type: "short_text",
        label: "Timeline",
        placeholder: "Needed by end of quarter",
      },
      {
        id: "budget",
        name: "Budget",
        type: "number",
        label: "Budget",
        placeholder: "5000",
      },
    ],
    submit: {
      label: "Request quote",
      size: "full-width",
    },
  },
};

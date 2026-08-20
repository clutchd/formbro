import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "new_customer_intake",
  version: 1,
  description: "Collect contact details, company context, and what the customer needs first.",
  category: "intake",
  tags: ["customers", "sales", "onboarding"],
  schema: {
    id: "new_customer_intake",
    name: "New Customer Intake",
    elements: [
      {
        id: "new_customer_intake_heading",
        name: "New customer",
        type: "heading",
        label: "New customer",
        level: 1,
      },
      {
        id: "new_customer_intake_intro",
        name: "New customer intro",
        type: "description",
        label: "Enough context to open the account and route the first follow-up.",
      },
      {
        id: "customer_name",
        name: "Primary contact",
        type: "short_text",
        label: "Primary contact",
        placeholder: "Taylor Morgan",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "customer_email",
        name: "Work email",
        type: "email",
        label: "Work email",
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
        id: "website",
        name: "Website",
        type: "link",
        label: "Website",
        placeholder: "https://",
      },
      {
        id: "need",
        name: "What do they need first?",
        type: "long_text",
        label: "What do they need first?",
        placeholder: "Kickoff call, quote, implementation plan...",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
    ],
    submit: {
      label: "Save customer",
      size: "full-width",
    },
  },
};

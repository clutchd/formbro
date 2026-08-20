import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "product_inquiry",
  version: 1,
  description: "Collect a product question with use case, area of interest, and reply details.",
  category: "inquiry",
  tags: ["products", "questions", "support", "it"],
  schema: {
    id: "product_inquiry",
    name: "Product Inquiry",
    elements: [
      {
        id: "product_inquiry_heading",
        name: "Ask about the product",
        type: "heading",
        label: "Ask about the product",
        level: 1,
      },
      {
        id: "product_inquiry_intro",
        name: "Ask about the product intro",
        type: "description",
        label: "Give us enough context to answer without sending you around the team.",
      },
      {
        id: "contact_name",
        name: "Name",
        type: "short_text",
        label: "Name",
        placeholder: "Taylor Morgan",
        rules: [{ type: "required", value: true }],
      },
      {
        id: "contact_email",
        name: "Email",
        type: "email",
        label: "Email",
        placeholder: "you@example.com",
        rules: [{ type: "required", value: true }],
      },
      {
        id: "product_area",
        name: "Product area",
        type: "single_select",
        label: "Product area",
        placeholder: "Select an area",
        options: ["Features", "Integrations", "Security", "Pricing", "Other"],
        rules: [{ type: "required", value: true }],
      },
      {
        id: "use_case",
        name: "Use case",
        type: "long_text",
        label: "Use case",
        placeholder: "What are you trying to accomplish?",
      },
      {
        id: "question",
        name: "Question",
        type: "long_text",
        label: "Question",
        placeholder: "What would you like to know?",
        rules: [{ type: "required", value: true }],
      },
    ],
    submit: {
      label: "Send question",
      size: "full-width",
    },
  },
};

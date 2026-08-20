import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "partnership_inquiry",
  version: 1,
  description: "Collect a company, website, and a short pitch for partnership review.",
  category: "inquiry",
  tags: ["partnerships", "sales"],
  schema: {
    id: "partnership_inquiry",
    name: "Partnership Inquiry",
    elements: [
      {
        id: "partnership_inquiry_heading",
        name: "Partnership inquiry",
        type: "heading",
        label: "Partnership inquiry",
        level: 1,
      },
      {
        id: "partnership_inquiry_intro",
        name: "Partnership inquiry intro",
        type: "description",
        label: "Tell us who you are and what you want to build together.",
      },
      {
        id: "contact_name",
        name: "Name",
        type: "short_text",
        label: "Name",
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
        id: "website",
        name: "Website",
        type: "link",
        label: "Website",
        placeholder: "https://",
      },
      {
        id: "pitch",
        name: "What is the partnership?",
        type: "long_text",
        label: "What is the partnership?",
        placeholder: "Audience, offer, and what you need from us.",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
    ],
    submit: {
      label: "Send inquiry",
      size: "full-width",
    },
  },
};

import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "vendor_application",
  version: 1,
  description: "Assess whether a vendor is a fit before adding them to the roster.",
  category: "application",
  tags: ["vendors", "procurement"],
  schema: {
    id: "vendor_application",
    name: "Vendor Application",
    elements: [
      {
        id: "vendor_application_heading",
        name: "Vendor application",
        type: "heading",
        label: "Vendor application",
        level: 1,
      },
      {
        id: "vendor_application_intro",
        name: "Vendor application intro",
        type: "description",
        label: "This is an assessment, not a registration. We will review and reply.",
      },
      {
        id: "org_name",
        name: "Organization name",
        type: "short_text",
        label: "Organization name",
        placeholder: "Prime Mechanical LLC",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "contact_name",
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
        id: "website",
        name: "Website",
        type: "link",
        label: "Website",
        placeholder: "https://",
      },
      {
        id: "specialty",
        name: "What do you specialize in?",
        type: "long_text",
        label: "What do you specialize in?",
        placeholder: "Commercial HVAC, after-hours coverage...",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "references",
        name: "References or recent work",
        type: "long_text",
        label: "References or recent work",
        placeholder: "Two clients we can call, or a portfolio link in the notes.",
      },
      {
        id: "pricing_notes",
        name: "Pricing notes",
        type: "long_text",
        label: "Pricing notes",
        placeholder: "Rate card, minimums, travel...",
      },
    ],
    submit: {
      label: "Submit application",
      size: "full-width",
    },
  },
};

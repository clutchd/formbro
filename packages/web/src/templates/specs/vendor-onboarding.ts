import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "vendor_onboarding",
  version: 1,
  description: "Collect vendor identity, services, and payment terms for accounting review.",
  category: "application",
  tags: ["vendors", "accounting", "onboarding"],
  featured: true,
  schema: {
    id: "vendor_onboarding",
    name: "Vendor Onboarding",
    elements: [
      {
        id: "vendor_onboarding_heading",
        name: "Start vendor onboarding",
        type: "heading",
        label: "Start vendor onboarding",
        level: 1,
      },
      {
        id: "vendor_onboarding_intro",
        name: "Start vendor onboarding intro",
        type: "description",
        label: "Collect vendor identity, services, and payment details before setup.",
      },
      {
        id: "vendor_name",
        name: "Vendor legal name",
        type: "short_text",
        label: "Vendor legal name",
        placeholder: "Prime Mechanical LLC",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "vendor_contact_email",
        name: "Accounts payable email",
        type: "email",
        label: "Accounts payable email",
        placeholder: "ap@vendor.com",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "tax_classification",
        name: "Tax classification",
        type: "single_select",
        label: "Tax classification",
        placeholder: "Select one",
        options: ["Individual", "LLC", "Corporation", "Partnership"],
      },
      {
        id: "services",
        name: "Services provided",
        type: "long_text",
        label: "Services provided",
        placeholder: "Preventive maintenance, emergency repairs...",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "monthly_spend",
        name: "Estimated monthly spend",
        type: "number",
        label: "Estimated monthly spend",
        placeholder: "2500",
      },
      {
        id: "payment_terms",
        name: "Preferred payment terms",
        type: "single_select",
        label: "Preferred payment terms",
        placeholder: "Select terms",
        options: ["Due on receipt", "Net 15", "Net 30", "Net 60"],
      },
    ],
    submit: {
      label: "Submit vendor",
      size: "full-width",
    },
  },
};

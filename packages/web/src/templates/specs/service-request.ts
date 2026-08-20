import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "service_request",
  version: 1,
  description: "Route a field request with site, owner, priority, and repair details.",
  category: "request",
  tags: ["facilities", "dispatch", "ops"],
  featured: true,
  schema: {
    id: "service_request",
    name: "Service Request",
    elements: [
      {
        id: "service_request_heading",
        name: "Route a service request",
        type: "heading",
        label: "Route a service request",
        level: 1,
      },
      {
        id: "service_request_intro",
        name: "Route a service request intro",
        type: "description",
        label: "Capture the site, urgency, and repair details in one clean workflow.",
      },
      {
        id: "site",
        name: "Site or property",
        type: "short_text",
        label: "Site or property",
        placeholder: "North warehouse",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "request_owner",
        name: "Request owner",
        type: "short_text",
        label: "Request owner",
        placeholder: "Jordan Lee",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "owner_email",
        name: "Owner email",
        type: "email",
        label: "Owner email",
        placeholder: "owner@company.com",
      },
      {
        id: "priority",
        name: "Priority",
        type: "single_select",
        label: "Priority",
        placeholder: "Select priority",
        options: ["Routine", "Soon", "Urgent", "Emergency"],
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "request_details",
        name: "What needs to happen?",
        type: "long_text",
        label: "What needs to happen?",
        description: "Include the deadline or handoff owner if you know it.",
        placeholder: "Repair dock door before Friday",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "reference_link",
        name: "Reference photo or ticket link",
        type: "link",
        label: "Reference photo or ticket link",
        placeholder: "https://...",
      },
    ],
    submit: {
      label: "Send request",
      size: "full-width",
    },
  },
};

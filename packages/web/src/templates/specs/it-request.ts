import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "it_request",
  version: 1,
  description: "File an access, hardware, or incident request with urgency and a ticket link.",
  category: "request",
  tags: ["it", "internal"],
  schema: {
    id: "it_request",
    name: "IT Request",
    elements: [
      {
        id: "it_request_heading",
        name: "IT request",
        type: "heading",
        label: "IT request",
        level: 1,
      },
      {
        id: "it_request_intro",
        name: "IT request intro",
        type: "description",
        label: "We will route this to the right queue.",
      },
      {
        id: "requester_name",
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
        id: "requester_email",
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
        id: "request_type",
        name: "Request type",
        type: "single_select",
        label: "Request type",
        placeholder: "Select a type",
        options: ["Access", "Hardware", "Software", "Incident"],
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
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
        id: "details",
        name: "What do you need?",
        type: "long_text",
        label: "What do you need?",
        placeholder: "System, account, or what broke.",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "ticket_link",
        name: "Existing ticket or screenshot link",
        type: "link",
        label: "Existing ticket or screenshot link",
        placeholder: "https://",
      },
    ],
    submit: {
      label: "Send to IT",
      size: "full-width",
    },
  },
};

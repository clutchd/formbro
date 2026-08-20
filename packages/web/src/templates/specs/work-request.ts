import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "work_request",
  version: 1,
  description: "Ask another team to take a job with owner, priority, and outcome.",
  category: "request",
  tags: ["internal", "ops"],
  schema: {
    id: "work_request",
    name: "Work Request",
    elements: [
      {
        id: "work_request_heading",
        name: "Work request",
        type: "heading",
        label: "Work request",
        level: 1,
      },
      {
        id: "work_request_intro",
        name: "Work request intro",
        type: "description",
        label: "A short brief is enough to put this on someone's list.",
      },
      {
        id: "title",
        name: "Request title",
        type: "short_text",
        label: "Request title",
        placeholder: "Update vendor roster",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "owner",
        name: "Requested by",
        type: "short_text",
        label: "Requested by",
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
        name: "Email",
        type: "email",
        label: "Email",
        placeholder: "you@company.com",
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
        name: "What should be done?",
        type: "long_text",
        label: "What should be done?",
        placeholder: "Outcome, deadline, and who should see it.",
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

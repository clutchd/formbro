import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "client_intake",
  version: 1,
  description: "Capture the client, company size, and the workflow that needs a clean handoff.",
  category: "intake",
  tags: ["clients", "ops", "handoff"],
  featured: true,
  schema: {
    id: "client_intake",
    name: "Client Intake",
    elements: [
      {
        id: "client_intake_heading",
        name: "Tell us about the workflow",
        type: "heading",
        label: "Tell us about the workflow",
        level: 1,
      },
      {
        id: "client_intake_intro",
        name: "Tell us about the workflow intro",
        type: "description",
        label: "Share the basics and we will turn them into a clean next step for your team.",
      },
      {
        id: "client_name",
        name: "Client name",
        type: "short_text",
        label: "Client name",
        placeholder: "Acme Operations",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "client_email",
        name: "Work email",
        type: "email",
        label: "Work email",
        placeholder: "you@company.com",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "company_size",
        name: "Company size",
        type: "single_select",
        label: "Company size",
        placeholder: "Select a range",
        options: ["1-10", "11-50", "51-200", "200+"],
      },
      {
        id: "workflow_type",
        name: "What workflow are we upgrading?",
        type: "single_select",
        label: "What workflow are we upgrading?",
        placeholder: "Select a workflow",
        options: ["Intake", "Approvals", "Field reports", "Onboarding"],
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "workflow_goal",
        name: "What needs to happen after someone submits?",
        type: "long_text",
        label: "What needs to happen after someone submits?",
        description: "A short handoff note is enough for the first pass.",
        placeholder: "Create a task, notify ops, send a PDF...",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
    ],
    submit: {
      label: "Submit intake",
      size: "full-width",
    },
  },
};

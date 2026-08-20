import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "employee_intake",
  version: 1,
  description: "Collect identity, role, and start notes before the first day.",
  category: "intake",
  tags: ["hr", "onboarding", "internal"],
  schema: {
    id: "employee_intake",
    name: "Employee Intake",
    elements: [
      {
        id: "employee_intake_heading",
        name: "Employee details",
        type: "heading",
        label: "Employee details",
        level: 1,
      },
      {
        id: "employee_intake_intro",
        name: "Employee details intro",
        type: "description",
        label: "Used by HR and the hiring manager to set up access and equipment.",
      },
      {
        id: "employee_name",
        name: "Full name",
        type: "short_text",
        label: "Full name",
        placeholder: "Taylor Morgan",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "employee_email",
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
        id: "role",
        name: "Role",
        type: "short_text",
        label: "Role",
        placeholder: "Operations coordinator",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "team",
        name: "Team",
        type: "single_select",
        label: "Team",
        placeholder: "Select a team",
        options: ["Operations", "Sales", "Support", "Engineering", "Finance"],
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "start_notes",
        name: "Start notes",
        type: "long_text",
        label: "Start notes",
        placeholder: "Laptop, accounts, first-week owner...",
      },
    ],
    submit: {
      label: "Submit intake",
      size: "full-width",
    },
  },
};

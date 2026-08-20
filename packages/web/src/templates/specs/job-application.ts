import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "job_application",
  version: 1,
  description: "Collect a candidate, role interest, and a resume link.",
  category: "application",
  tags: ["hiring", "hr"],
  schema: {
    id: "job_application",
    name: "Job Application",
    elements: [
      {
        id: "job_application_heading",
        name: "Job application",
        type: "heading",
        label: "Job application",
        level: 1,
      },
      {
        id: "job_application_intro",
        name: "Job application intro",
        type: "description",
        label: "Link a resume instead of uploading a file. We will review and follow up.",
      },
      {
        id: "candidate_name",
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
        id: "candidate_email",
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
        id: "role",
        name: "Role",
        type: "single_select",
        label: "Role",
        placeholder: "Select a role",
        options: ["Operations", "Support", "Engineering", "Sales"],
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "resume_link",
        name: "Resume or portfolio link",
        type: "link",
        label: "Resume or portfolio link",
        placeholder: "https://",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "why",
        name: "Why this role?",
        type: "long_text",
        label: "Why this role?",
        placeholder: "A short note is enough.",
      },
    ],
    submit: {
      label: "Apply",
      size: "full-width",
    },
  },
};

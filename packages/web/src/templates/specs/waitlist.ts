import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "waitlist",
  version: 1,
  description: "Capture interest when a session, product, or list is full.",
  category: "registration",
  tags: ["waitlist", "demand"],
  schema: {
    id: "waitlist",
    name: "Waitlist",
    elements: [
      {
        id: "waitlist_heading",
        name: "Join the waitlist",
        type: "heading",
        label: "Join the waitlist",
        level: 1,
      },
      {
        id: "waitlist_intro",
        name: "Join the waitlist intro",
        type: "description",
        label: "We will reach out in order when a spot opens.",
      },
      {
        id: "waitlist_name",
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
        id: "waitlist_email",
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
        id: "interest",
        name: "What are you waiting for?",
        type: "long_text",
        label: "What are you waiting for?",
        placeholder: "Next cohort, restock, office hours...",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
    ],
    submit: {
      label: "Join waitlist",
      size: "full-width",
    },
  },
};

import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "workshop_registration",
  version: 1,
  description: "Reserve a seat and capture what would make the session useful.",
  category: "registration",
  categories: ["registration", "event-registration"],
  tags: ["events", "workshops", "education"],
  featured: true,
  schema: {
    id: "workshop_registration",
    name: "Workshop Registration",
    elements: [
      {
        id: "workshop_registration_heading",
        name: "Reserve your workshop seat",
        type: "heading",
        label: "Reserve your workshop seat",
        level: 1,
      },
      {
        id: "workshop_registration_intro",
        name: "Reserve your workshop seat intro",
        type: "description",
        label: "Tell us who is coming and what will make the session useful.",
      },
      {
        id: "attendee_name",
        name: "Attendee name",
        type: "short_text",
        label: "Attendee name",
        placeholder: "Taylor Morgan",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "attendee_email",
        name: "Attendee email",
        type: "email",
        label: "Attendee email",
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
        id: "session_track",
        name: "Which track should we save?",
        type: "single_select",
        label: "Which track should we save?",
        placeholder: "Select a track",
        options: ["Operations", "Sales", "Customer success", "Leadership"],
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "workshop_goal",
        name: "What would make this workshop worth it?",
        type: "long_text",
        label: "What would make this workshop worth it?",
        placeholder: "Bring a messy process, leave with a better form.",
      },
    ],
    submit: {
      label: "Reserve seat",
      size: "full-width",
    },
  },
};

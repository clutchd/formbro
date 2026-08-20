import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "conference_registration",
  version: 1,
  description: "Collect attendee details, session preferences, and dietary notes.",
  category: "registration",
  categories: ["registration", "event-registration"],
  tags: ["events", "conferences"],
  schema: {
    id: "conference_registration",
    name: "Conference Registration",
    elements: [
      {
        id: "conference_registration_heading",
        name: "Conference registration",
        type: "heading",
        label: "Conference registration",
        level: 1,
      },
      {
        id: "conference_registration_intro",
        name: "Conference registration intro",
        type: "description",
        label: "We will use this to badge you and plan the sessions.",
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
        id: "ticket_type",
        name: "Ticket type",
        type: "single_select",
        label: "Ticket type",
        placeholder: "Select a ticket",
        options: ["General", "Workshop add-on", "Team"],
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "dietary",
        name: "Dietary notes",
        type: "short_text",
        label: "Dietary notes",
        placeholder: "None, vegetarian, allergies...",
      },
    ],
    submit: {
      label: "Register",
      size: "full-width",
    },
  },
};

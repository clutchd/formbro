import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "rsvp",
  version: 2,
  description: "Collect attendance, guest count, and a note for the host.",
  category: "registration",
  categories: ["registration", "event-registration"],
  tags: ["events", "rsvp"],
  schema: {
    id: "rsvp",
    name: "Event RSVP",
    elements: [
      {
        id: "rsvp_heading",
        name: "RSVP",
        type: "heading",
        label: "RSVP",
        level: 1,
      },
      {
        id: "rsvp_intro",
        name: "RSVP intro",
        type: "description",
        label: "Let us know if you can make it.",
      },
      {
        id: "guest_name",
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
        id: "guest_email",
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
        id: "guest_phone",
        name: "Phone",
        type: "phone",
        label: "Phone",
        placeholder: "+1 555 123 4567",
      },
      {
        id: "attending",
        name: "Will you attend?",
        type: "single_select",
        label: "Will you attend?",
        placeholder: "Select one",
        options: ["Yes", "No", "Maybe"],
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "guest_count",
        name: "Number of guests",
        type: "number",
        label: "Number of guests",
        placeholder: "1",
      },
      {
        id: "note",
        name: "Note for the host",
        type: "long_text",
        label: "Note for the host",
        placeholder: "Allergies, arrival time, plus-one name...",
      },
    ],
    submit: {
      label: "Send RSVP",
      size: "full-width",
    },
  },
};

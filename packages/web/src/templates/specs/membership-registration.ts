import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "membership_registration",
  version: 2,
  description: "Register a new member with contact details and membership type.",
  category: "registration",
  tags: ["membership", "clubs"],
  schema: {
    id: "membership_registration",
    name: "Club Membership",
    elements: [
      {
        id: "membership_registration_heading",
        name: "Membership registration",
        type: "heading",
        label: "Membership registration",
        level: 1,
      },
      {
        id: "membership_registration_intro",
        name: "Membership registration intro",
        type: "description",
        label: "We will use this to add you to the roster and send next steps.",
      },
      {
        id: "member_name",
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
        id: "member_email",
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
        id: "member_phone",
        name: "Phone",
        type: "phone",
        label: "Phone",
        placeholder: "+1 555 123 4567",
      },
      {
        id: "membership_type",
        name: "Membership type",
        type: "single_select",
        label: "Membership type",
        placeholder: "Select a type",
        options: ["Individual", "Family", "Student"],
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "how_heard",
        name: "How did you hear about us?",
        type: "short_text",
        label: "How did you hear about us?",
        placeholder: "Friend, event, search...",
      },
    ],
    submit: {
      label: "Join",
      size: "full-width",
    },
  },
};

import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "contact",
  version: 1,
  description: "A short contact form for name, email, and a message.",
  category: "inquiry",
  tags: ["contact", "website"],
  schema: {
    id: "contact",
    name: "Contact",
    elements: [
      {
        id: "contact_heading",
        name: "Contact us",
        type: "heading",
        label: "Contact us",
        level: 1,
      },
      {
        id: "contact_intro",
        name: "Contact us intro",
        type: "description",
        label: "We will reply to the email you leave.",
      },
      {
        id: "name",
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
        id: "email",
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
        id: "message",
        name: "Message",
        type: "long_text",
        label: "Message",
        placeholder: "How can we help?",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
    ],
    submit: {
      label: "Send message",
      size: "full-width",
    },
  },
};

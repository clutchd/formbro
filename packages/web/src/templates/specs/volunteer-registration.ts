import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "volunteer_registration",
  version: 2,
  description: "Collect contact details, skills, and availability for volunteer shifts.",
  category: "registration",
  tags: ["nonprofit", "volunteers"],
  schema: {
    id: "volunteer_registration",
    name: "Volunteer Registration",
    elements: [
      {
        id: "volunteer_registration_heading",
        name: "Volunteer sign-up",
        type: "heading",
        label: "Volunteer sign-up",
        level: 1,
      },
      {
        id: "volunteer_registration_intro",
        name: "Volunteer sign-up intro",
        type: "description",
        label: "Tell us how you can help and when you are free.",
      },
      {
        id: "volunteer_name",
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
        id: "volunteer_email",
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
        id: "volunteer_phone",
        name: "Phone",
        type: "phone",
        label: "Phone",
        placeholder: "+1 555 123 4567",
      },
      {
        id: "skills",
        name: "Skills or roles you can cover",
        type: "long_text",
        label: "Skills or roles you can cover",
        placeholder: "Check-in, logistics, photography...",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "availability",
        name: "Availability",
        type: "single_select",
        label: "Availability",
        placeholder: "Select availability",
        options: ["Weekdays", "Evenings", "Weekends", "Flexible"],
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
    ],
    submit: {
      label: "Sign up",
      size: "full-width",
    },
  },
};

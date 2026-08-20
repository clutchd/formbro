import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "customer_feedback",
  version: 1,
  description: "Collect a score and what happened so support can follow up.",
  category: "feedback",
  tags: ["customers", "support"],
  schema: {
    id: "customer_feedback",
    name: "Customer Feedback",
    elements: [
      {
        id: "customer_feedback_heading",
        name: "Customer feedback",
        type: "heading",
        label: "Customer feedback",
        level: 1,
      },
      {
        id: "customer_feedback_intro",
        name: "Customer feedback intro",
        type: "description",
        label: "Tell us how it went. We read every submission.",
      },
      {
        id: "customer_name",
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
        id: "customer_email",
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
        id: "score",
        name: "How did we do?",
        type: "single_select",
        label: "How did we do?",
        placeholder: "Select a score",
        options: ["1", "2", "3", "4", "5"],
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "what_happened",
        name: "What happened?",
        type: "long_text",
        label: "What happened?",
        placeholder: "The order, the visit, the ticket...",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
    ],
    submit: {
      label: "Send feedback",
      size: "full-width",
    },
  },
};

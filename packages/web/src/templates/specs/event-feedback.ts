import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "event_feedback",
  version: 1,
  description: "Score an event and capture what to keep or change next time.",
  category: "feedback",
  tags: ["events", "feedback"],
  schema: {
    id: "event_feedback",
    name: "Event Feedback",
    elements: [
      {
        id: "event_feedback_heading",
        name: "Event feedback",
        type: "heading",
        label: "Event feedback",
        level: 1,
      },
      {
        id: "event_feedback_intro",
        name: "Event feedback intro",
        type: "description",
        label: "A score and one note is enough to improve the next one.",
      },
      {
        id: "event_name",
        name: "Event",
        type: "short_text",
        label: "Event",
        placeholder: "Ops workshop, March",
      },
      {
        id: "score",
        name: "How was it?",
        type: "single_select",
        label: "How was it?",
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
        id: "comments",
        name: "What should we keep or change?",
        type: "long_text",
        label: "What should we keep or change?",
        placeholder: "Be specific if you can.",
      },
    ],
    submit: {
      label: "Send feedback",
      size: "full-width",
    },
  },
};

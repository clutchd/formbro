import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "course_evaluation",
  version: 1,
  description: "Evaluate a course with a score, session, and notes for the instructor.",
  category: "feedback",
  tags: ["education", "evaluation"],
  schema: {
    id: "course_evaluation",
    name: "Course Evaluation",
    elements: [
      {
        id: "course_evaluation_heading",
        name: "Course evaluation",
        type: "heading",
        label: "Course evaluation",
        level: 1,
      },
      {
        id: "course_evaluation_intro",
        name: "Course evaluation intro",
        type: "description",
        label: "Used to improve the next session, not as a grade.",
      },
      {
        id: "course",
        name: "Course",
        type: "short_text",
        label: "Course",
        placeholder: "Foundations",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "score",
        name: "Overall score",
        type: "single_select",
        label: "Overall score",
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
        id: "notes",
        name: "Notes for the instructor",
        type: "long_text",
        label: "Notes for the instructor",
        placeholder: "What landed, what did not.",
      },
    ],
    submit: {
      label: "Submit evaluation",
      size: "full-width",
    },
  },
};

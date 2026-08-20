import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "admissions_inquiry",
  version: 1,
  description:
    "Collect a prospective student's program interest, timeline, and admissions question.",
  category: "inquiry",
  categories: ["inquiry", "application"],
  tags: ["education", "admissions", "students"],
  schema: {
    id: "admissions_inquiry",
    name: "Admissions Inquiry",
    elements: [
      {
        id: "admissions_inquiry_heading",
        name: "Ask admissions",
        type: "heading",
        label: "Ask admissions",
        level: 1,
      },
      {
        id: "admissions_inquiry_intro",
        name: "Ask admissions intro",
        type: "description",
        label: "Tell us what you want to study and we will connect you with the right program.",
      },
      {
        id: "student_name",
        name: "Student name",
        type: "short_text",
        label: "Student name",
        placeholder: "Taylor Morgan",
        rules: [{ type: "required", value: true }],
      },
      {
        id: "student_email",
        name: "Email",
        type: "email",
        label: "Email",
        placeholder: "you@example.com",
        rules: [{ type: "required", value: true }],
      },
      {
        id: "program",
        name: "Program of interest",
        type: "single_select",
        label: "Program of interest",
        placeholder: "Select a program",
        options: ["Certificate", "Undergraduate", "Graduate", "Continuing education"],
        rules: [{ type: "required", value: true }],
      },
      {
        id: "start_timeline",
        name: "When do you want to start?",
        type: "single_select",
        label: "When do you want to start?",
        placeholder: "Select a term",
        options: ["Next term", "Within a year", "Still exploring"],
      },
      {
        id: "question",
        name: "Admissions question",
        type: "long_text",
        label: "Admissions question",
        placeholder: "Ask about requirements, schedule, or the program.",
        rules: [{ type: "required", value: true }],
      },
    ],
    submit: {
      label: "Ask admissions",
      size: "full-width",
    },
  },
};

import type { TemplateDefinition } from "../types";

export const template: TemplateDefinition = {
  id: "course_registration",
  version: 2,
  description: "Sign students up for a course with contact details and schedule preference.",
  category: "registration",
  tags: ["education", "courses"],
  schema: {
    id: "course_registration",
    name: "Course Registration",
    elements: [
      {
        id: "course_registration_heading",
        name: "Course registration",
        type: "heading",
        label: "Course registration",
        level: 1,
      },
      {
        id: "course_registration_intro",
        name: "Course registration intro",
        type: "description",
        label: "Tell us who is enrolling and which offering to reserve.",
      },
      {
        id: "student_name",
        name: "Student name",
        type: "short_text",
        label: "Student name",
        placeholder: "Taylor Morgan",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "student_email",
        name: "Student email",
        type: "email",
        label: "Student email",
        placeholder: "you@example.com",
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "student_phone",
        name: "Student phone",
        type: "phone",
        label: "Student phone",
        placeholder: "+1 555 123 4567",
      },
      {
        id: "course",
        name: "Course",
        type: "single_select",
        label: "Course",
        placeholder: "Select a course",
        options: ["Foundations", "Operations lab", "Advanced workshop"],
        rules: [
          {
            type: "required",
            value: true,
          },
        ],
      },
      {
        id: "schedule",
        name: "Preferred schedule",
        type: "single_select",
        label: "Preferred schedule",
        placeholder: "Select a schedule",
        options: ["Weekday mornings", "Weekday evenings", "Weekend"],
      },
    ],
    submit: {
      label: "Enroll",
      size: "full-width",
    },
  },
};

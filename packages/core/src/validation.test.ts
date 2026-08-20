import { describe, expect, it } from "bun:test";
import { compile } from "./compile";
import { validateFormSubmission } from "./validation";

describe("validateFormSubmission", () => {
  const form = compile({
    id: "submission_validation",
    name: "Submission validation",
    elements: [
      {
        id: "email",
        name: "Email",
        type: "email",
        label: "Email",
        rules: [{ type: "required", value: true, event: "onSubmit" }],
      },
      {
        id: "notes",
        name: "Notes",
        type: "long_text",
        label: "Notes",
        rules: [
          { type: "min", value: 3, event: "onSubmit" },
          { type: "max", value: 10, event: "onSubmit" },
        ],
      },
      {
        id: "count",
        name: "Count",
        type: "number",
        label: "Count",
        rules: [
          { type: "min", value: 2, event: "onSubmit" },
          { type: "max", value: 4, event: "onSubmit" },
        ],
      },
    ],
  });

  it("accepts submissions that satisfy the compiled validator plan", () => {
    expect(
      validateFormSubmission(form, {
        email: "hello@example.com",
        notes: "hello",
        count: "3",
      }),
    ).toEqual({ success: true });

    expect(
      validateFormSubmission(form, {
        email: "hello@example.com",
        notes: "hello",
        count: 3,
      }),
    ).toEqual({ success: true });
  });

  it("rejects invalid non-numeric types for number fields", () => {
    expect(
      validateFormSubmission(form, {
        email: "hello@example.com",
        notes: "hello",
        count: true,
      }),
    ).toEqual({
      issues: [{ fieldId: "count", message: "Count must be a number or numeric string" }],
      success: false,
    });
  });

  it("rejects invalid values and unknown fields", () => {
    const result = validateFormSubmission(form, {
      email: "nope",
      notes: "hi",
      count: "7",
      unexpected: "value",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toHaveLength(4);
      expect(result.issues.map((issue) => issue.fieldId)).toEqual([
        "unexpected",
        "email",
        "notes",
        "count",
      ]);
    }
  });

  it("validates required radio groups", () => {
    const radioForm = compile({
      id: "radio_validation",
      name: "Radio validation",
      elements: [
        {
          id: "attendance",
          name: "Attendance",
          type: "radio_group",
          label: "Will you attend?",
          options: ["Yes", "No"],
          rules: [{ type: "required", value: true, event: "onSubmit" }],
        },
      ],
    });

    expect(validateFormSubmission(radioForm, { attendance: "Yes" })).toEqual({ success: true });
    expect(validateFormSubmission(radioForm, { attendance: "" })).toEqual({
      issues: [{ fieldId: "attendance", message: "Will you attend? is required" }],
      success: false,
    });
  });

  it("validates checkbox groups as required array values", () => {
    const checkboxForm = compile({
      id: "checkbox_validation",
      name: "Checkbox validation",
      elements: [
        {
          id: "skills",
          name: "Skills",
          type: "checkbox_group",
          label: "Select your skills",
          options: ["TypeScript", "React"],
          rules: [{ type: "required", value: true, event: "onSubmit" }],
        },
      ],
    });

    expect(validateFormSubmission(checkboxForm, { skills: ["TypeScript", "React"] })).toEqual({
      success: true,
    });
    expect(validateFormSubmission(checkboxForm, { skills: [] })).toEqual({
      issues: [{ fieldId: "skills", message: "Select your skills is required" }],
      success: false,
    });
    expect(validateFormSubmission(checkboxForm, { skills: [""] })).toEqual({
      issues: [{ fieldId: "skills", message: "Select your skills is required" }],
      success: false,
    });
    expect(validateFormSubmission(checkboxForm, { skills: ["   "] })).toEqual({
      issues: [{ fieldId: "skills", message: "Select your skills is required" }],
      success: false,
    });
    expect(validateFormSubmission(checkboxForm, {})).toEqual({
      issues: [{ fieldId: "skills", message: "Select your skills is required" }],
      success: false,
    });
    expect(validateFormSubmission(checkboxForm, { skills: "TypeScript" })).toEqual({
      issues: [{ fieldId: "skills", message: "Select your skills must be a list of choices" }],
      success: false,
    });
    expect(validateFormSubmission(checkboxForm, { skills: null })).toEqual({
      issues: [{ fieldId: "skills", message: "Select your skills must be a list of choices" }],
      success: false,
    });
  });

  it("validates date fields as ISO calendar dates", () => {
    const dateForm = compile({
      id: "date_validation",
      name: "Date validation",
      elements: [
        {
          id: "start_date",
          name: "Start date",
          type: "date",
          label: "Start date",
          rules: [{ type: "required", value: true, event: "onSubmit" }],
        },
      ],
    });

    expect(validateFormSubmission(dateForm, { start_date: "2026-08-19" })).toEqual({
      success: true,
    });
    expect(validateFormSubmission(dateForm, { start_date: "2026-02-29" })).toEqual({
      issues: [{ fieldId: "start_date", message: "Invalid ISO date" }],
      success: false,
    });
    expect(validateFormSubmission(dateForm, { start_date: "August 19, 2026" })).toEqual({
      issues: [{ fieldId: "start_date", message: "Invalid ISO date" }],
      success: false,
    });
  });

  it("accepts broad phone formats but rejects whitespace-only required values", () => {
    const phoneForm = compile({
      id: "phone_validation",
      name: "Phone validation",
      elements: [
        {
          id: "phone",
          name: "Phone",
          type: "phone",
          label: "Phone",
          rules: [{ type: "required", value: true, event: "onSubmit" }],
        },
      ],
    });

    expect(validateFormSubmission(phoneForm, { phone: "+44 (0)20 7946 0958 ext. 2" })).toEqual({
      success: true,
    });
    expect(validateFormSubmission(phoneForm, { phone: "   " })).toEqual({
      issues: [{ fieldId: "phone", message: "Phone is required" }],
      success: false,
    });
  });

  it("enforces checkbox group array values without validation rules", () => {
    const checkboxForm = compile({
      id: "optional_checkbox_validation",
      name: "Optional checkbox validation",
      elements: [
        {
          id: "confirmations",
          name: "Confirmations",
          type: "checkbox_group",
          label: "Confirm any that apply",
          options: ["I agree"],
        },
      ],
    });

    expect(validateFormSubmission(checkboxForm, { confirmations: [] })).toEqual({ success: true });
    expect(validateFormSubmission(checkboxForm, { confirmations: "I agree" })).toEqual({
      issues: [
        { fieldId: "confirmations", message: "Confirm any that apply must be a list of choices" },
      ],
      success: false,
    });
  });

  it("rejects array values for scalar fields", () => {
    const scalarForm = compile({
      id: "scalar_shape_validation",
      name: "Scalar shape validation",
      elements: [
        {
          id: "name",
          name: "Name",
          type: "short_text",
          label: "Your name",
        },
      ],
    });

    expect(validateFormSubmission(scalarForm, { name: ["Ada", "Lovelace"] })).toEqual({
      issues: [{ fieldId: "name", message: "Your name must be a string" }],
      success: false,
    });
  });
});

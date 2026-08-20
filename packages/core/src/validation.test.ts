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
});

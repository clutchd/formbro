import { describe, expect, it } from "bun:test";
import type { FormInput } from "./schema/form";
import { summarizeFormSchemaChanges } from "./diff";

const baseSchema = {
  id: "contact",
  name: "Contact",
  elements: [
    {
      id: "name",
      name: "Name",
      type: "short_text",
      label: "Your Name",
    },
  ],
} satisfies FormInput;

describe("summarizeFormSchemaChanges", () => {
  it("summarizes added, removed, and updated elements", () => {
    const operations = summarizeFormSchemaChanges(baseSchema, {
      ...baseSchema,
      elements: [
        {
          id: "name",
          name: "Name",
          type: "short_text",
          label: "Full Name",
        },
        {
          id: "email",
          name: "Email",
          type: "email",
          label: "Email",
        },
      ],
    });

    expect(operations).toEqual([
      { label: "Added 1 element", type: "add" },
      { label: "Updated Full Name", type: "update" },
    ]);
  });

  it("summarizes form title and submit changes", () => {
    const operations = summarizeFormSchemaChanges(baseSchema, {
      ...baseSchema,
      name: "Contact Us",
      submit: {
        label: "Send",
      },
    });

    expect(operations).toEqual([
      { label: "Updated form title", type: "update" },
      { label: "Updated submit button", type: "update" },
    ]);
  });

  it("reports removals", () => {
    const operations = summarizeFormSchemaChanges(
      {
        ...baseSchema,
        elements: [
          ...baseSchema.elements,
          {
            id: "email",
            name: "Email",
            type: "email",
            label: "Email",
          },
        ],
      },
      baseSchema,
    );

    expect(operations).toEqual([{ label: "Removed 1 element", type: "remove" }]);
  });
});

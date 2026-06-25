import { describe, expect, it } from "bun:test";
import type { FormInput } from "./schema/form";
import { summarizeFormSchemaChangeResult, summarizeFormSchemaChanges } from "./diff";

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
      { count: 1, label: "Added 1 field", target: "field", type: "add" },
      { count: 1, label: "Updated Full Name", target: "field", type: "update" },
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
      { label: "Updated form title", target: "title", type: "update" },
      { label: "Updated submit button", target: "submit", type: "update" },
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

    expect(operations).toEqual([
      { count: 1, label: "Removed 1 field", target: "field", type: "remove" },
    ]);
  });

  it("summarizes pages and logic separately", () => {
    const operations = summarizeFormSchemaChanges(baseSchema, {
      ...baseSchema,
      elements: [
        ...baseSchema.elements,
        {
          id: "page-two",
          name: "Page Two",
          type: "page_break",
          label: "Recommendations",
        },
        {
          id: "notes",
          name: "Notes",
          type: "description",
          label: "Share any context before submitting.",
        },
      ],
      listeners: [{ type: "uppercase", source: "name", target: "name" }],
    });

    expect(operations).toEqual([
      { count: 1, label: "Added 1 page", target: "page", type: "add" },
      { count: 1, label: "Added 1 element", target: "element", type: "add" },
      { count: 1, label: "Added 1 logic rule", target: "logic", type: "add" },
    ]);
  });

  it("summarizes full-form rebuilds without raw add/remove churn", () => {
    const before = {
      id: "survey",
      name: "Post Party Survey",
      elements: [
        { id: "title", name: "Title", type: "heading", label: "Post Party Survey" },
        { id: "full_name", name: "Full name", type: "short_text", label: "Your name" },
        { id: "email", name: "Email", type: "email", label: "Email" },
        { id: "page_venue", name: "Venue page", type: "page_break", label: "Venue" },
        { id: "venue_heading", name: "Venue heading", type: "heading", label: "Venue" },
        { id: "venue_rating", name: "Venue rating", type: "single_select", label: "Venue rating" },
        { id: "page_music", name: "Music page", type: "page_break", label: "Music" },
        { id: "music_heading", name: "Music heading", type: "heading", label: "Music" },
        { id: "music_rating", name: "Music rating", type: "single_select", label: "Music rating" },
      ],
      submit: { label: "Submit Survey" },
    } satisfies FormInput;
    const after = {
      id: "survey",
      name: "Client Intake Form",
      elements: [
        { id: "title", name: "Title", type: "heading", label: "Client Intake Form" },
        {
          id: "contact_heading",
          name: "Contact heading",
          type: "heading",
          label: "Contact details",
        },
        { id: "client_name", name: "Client name", type: "short_text", label: "Name" },
        { id: "client_email", name: "Client email", type: "email", label: "Email" },
        { id: "page_service", name: "Service page", type: "page_break", label: "Service" },
        { id: "service_heading", name: "Service heading", type: "heading", label: "Service needs" },
        { id: "service_type", name: "Service type", type: "single_select", label: "Service type" },
        {
          id: "project_description",
          name: "Project description",
          type: "long_text",
          label: "Project description",
        },
        { id: "page_timeline", name: "Timeline page", type: "page_break", label: "Timeline" },
        {
          id: "preferred_timeline",
          name: "Preferred timeline",
          type: "short_text",
          label: "Timeline",
        },
      ],
      submit: { label: "Submit Request" },
    } satisfies FormInput;

    const result = summarizeFormSchemaChangeResult(before, after);

    expect(result.summary).toBe("Created Client Intake Form with 5 fields across 3 pages.");
    expect(result.operations.map((operation) => operation.label)).toEqual([
      "Updated form title",
      "Built 5 fields",
      "Organized into 3 pages",
      "Added 3 elements",
      "Updated submit button",
    ]);
    expect(result.operations.some((operation) => operation.label.startsWith("Removed"))).toBe(
      false,
    );
    expect(
      result.operations.some((operation) => operation.label === "Updated Client Intake Form"),
    ).toBe(false);
  });
});

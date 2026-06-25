import { describe, expect, test } from "bun:test";
import {
  applyFormSchemaEdit,
  FormSchemaEditInputSchema,
  parseFinishFormSchemaEditOutput,
  parseFormSchemaEditInputPreview,
  parseFormSchemaEditOutput,
} from "./ai.js";
import { createDefaultFormSchema, type FormInput } from "./schema/form.js";

const blankSchema: FormInput = {
  id: "demo",
  name: "Untitled form",
  elements: [],
  submit: { label: "Submit", size: "full-width" },
};

describe("applyFormSchemaEdit", () => {
  test("matches the homepage draft step cadence", () => {
    let schema = blankSchema;

    let result = applyFormSchemaEdit(schema, {
      label: "Naming the workshop registration",
      name: "Workshop Registration",
      type: "set_form_name",
    });
    schema = result.schema;
    expect(result.operations).toEqual([
      { label: "Updated form name", target: "title", type: "update" },
    ]);

    result = applyFormSchemaEdit(schema, {
      elements: [
        {
          id: "event_heading",
          name: "Workshop registration heading",
          type: "heading",
          label: "Reserve your workshop seat",
          level: 1,
        },
        {
          id: "event_intro",
          name: "Workshop registration intro",
          type: "description",
          label: "Tell us who is coming and what will make the session useful.",
        },
      ],
      label: "Writing the registration intro",
      placements: [{ id: "event_heading" }, { afterId: "event_heading", id: "event_intro" }],
      type: "add_layout_elements",
    });
    schema = result.schema;
    expect(result.operations).toEqual([
      { count: 2, label: "Added 2 elements", target: "element", type: "add" },
    ]);

    result = applyFormSchemaEdit(schema, {
      elements: [
        {
          id: "attendee_name",
          name: "Attendee name",
          type: "short_text",
          label: "Attendee name",
          rules: [{ type: "required", value: true }],
        },
        {
          id: "attendee_email",
          name: "Attendee email",
          type: "email",
          label: "Attendee email",
          rules: [{ type: "required", value: true }],
        },
        {
          id: "company",
          name: "Company",
          type: "short_text",
          label: "Company",
        },
      ],
      label: "Adding attendee questions",
      placements: [
        { afterId: "event_intro", id: "attendee_name" },
        { afterId: "attendee_name", id: "attendee_email" },
        { afterId: "attendee_email", id: "company" },
      ],
      type: "add_fields",
    });
    schema = result.schema;
    expect(result.operations).toEqual([
      { count: 3, label: "Added 3 fields", target: "field", type: "add" },
    ]);

    result = applyFormSchemaEdit(schema, {
      elements: [
        {
          id: "session_track",
          name: "Session track",
          type: "single_select",
          label: "Which track should we save?",
          options: ["Operations", "Sales", "Customer success", "Leadership"],
        },
        {
          id: "workshop_goal",
          name: "Workshop goal",
          type: "long_text",
          label: "What would make this workshop worth it?",
        },
      ],
      label: "Adding session preferences",
      placements: [
        { afterId: "company", id: "session_track" },
        { afterId: "session_track", id: "workshop_goal" },
      ],
      type: "add_fields",
    });
    schema = result.schema;
    expect(result.operations).toEqual([
      { count: 2, label: "Added 2 fields", target: "field", type: "add" },
    ]);

    result = applyFormSchemaEdit(schema, {
      label: "Setting the registration button",
      submit: { label: "Reserve seat", size: "full-width" },
      type: "update_submit",
    });
    schema = result.schema;

    expect(schema.elements.map((element) => element.id)).toEqual([
      "event_heading",
      "event_intro",
      "attendee_name",
      "attendee_email",
      "company",
      "session_track",
      "workshop_goal",
    ]);
    expect(schema.submit).toEqual({ label: "Reserve seat", size: "full-width" });
  });

  test("streams multiple pages without a leading page break", () => {
    let schema = createDefaultFormSchema({ id: "post_party", name: "test" });

    schema = applyFormSchemaEdit(schema, {
      ids: ["title"],
      label: "Removed old first page content",
      type: "remove_elements",
    }).schema;
    schema = applyFormSchemaEdit(schema, {
      label: "Naming the survey",
      name: "Post-Party Feedback Survey",
      type: "set_form_name",
    }).schema;
    schema = applyFormSchemaEdit(schema, {
      elements: [
        {
          id: "attendee_heading",
          name: "Attendee heading",
          type: "heading",
          label: "Tell us about yourself",
          level: 2,
        },
        {
          id: "attendee_intro",
          name: "Attendee intro",
          type: "description",
          label: "Your contact info helps us follow up if needed.",
        },
      ],
      label: "Adding attendee intro",
      placements: [
        { id: "attendee_heading" },
        { afterId: "attendee_heading", id: "attendee_intro" },
      ],
      type: "add_layout_elements",
    }).schema;
    schema = applyFormSchemaEdit(schema, {
      elements: [
        {
          id: "attendee_name",
          name: "Attendee name",
          type: "short_text",
          label: "Name",
        },
      ],
      label: "Adding attendee fields",
      placements: [{ afterId: "attendee_intro", id: "attendee_name" }],
      type: "add_fields",
    }).schema;
    schema = applyFormSchemaEdit(schema, {
      elements: [
        {
          id: "experience_page",
          name: "Experience page",
          type: "page_break",
          label: "Overall Experience",
        },
      ],
      label: "Adding experience page",
      placements: [{ afterId: "attendee_name", id: "experience_page" }],
      type: "add_pages",
    }).schema;
    schema = applyFormSchemaEdit(schema, {
      elements: [
        {
          id: "experience_heading",
          name: "Experience heading",
          type: "heading",
          label: "Overall experience",
          level: 2,
        },
      ],
      label: "Adding experience heading",
      placements: [{ afterId: "experience_page", id: "experience_heading" }],
      type: "add_layout_elements",
    }).schema;
    const result = applyFormSchemaEdit(schema, {
      elements: [
        {
          id: "experience_rating",
          name: "Experience rating",
          type: "single_select",
          label: "How was the party?",
          options: ["Great", "Okay", "Poor"],
        },
      ],
      label: "Adding experience questions",
      placements: [{ afterId: "experience_heading", id: "experience_rating" }],
      type: "add_fields",
    });

    expect(result.schema.elements.map((element) => element.id)).toEqual([
      "attendee_heading",
      "attendee_intro",
      "attendee_name",
      "experience_page",
      "experience_heading",
      "experience_rating",
    ]);
    expect(result.schema.elements[0]?.type).not.toBe("page_break");
  });

  test("throws for missing element ids instead of silently ignoring failed edits", () => {
    const schema = createDefaultFormSchema({ id: "client_intake", name: "Client Intake" });

    expect(() =>
      applyFormSchemaEdit(schema, {
        ids: ["missing"],
        label: "Removed missing element",
        type: "remove_elements",
      }),
    ).toThrow("unknown element missing");
  });

  test("throws when an add operation mixes categories", () => {
    const schema = createDefaultFormSchema({ id: "client_intake", name: "Client Intake" });

    expect(() =>
      applyFormSchemaEdit(schema, {
        elements: [{ id: "first", name: "First", type: "short_text", label: "First" }],
        label: "Added first page",
        placements: [{ afterId: "title", id: "first" }],
        type: "add_pages",
      }),
    ).toThrow("add_pages cannot add short_text");
  });

  test("requires placements for every add stage", () => {
    expect(
      FormSchemaEditInputSchema.safeParse({
        elements: [{ id: "first", name: "First", type: "page_break", label: "First" }],
        label: "Added first page",
        type: "add_pages",
      }).success,
    ).toBe(false);

    expect(
      FormSchemaEditInputSchema.safeParse({
        elements: [{ id: "first", name: "First", type: "short_text", label: "First" }],
        label: "Added first field",
        type: "add_fields",
      }).success,
    ).toBe(false);
  });

  test("rejects non-snake-case generated element ids", () => {
    expect(
      FormSchemaEditInputSchema.safeParse({
        elements: [
          {
            id: "attendee-info",
            name: "Attendee info",
            type: "heading",
            label: "Tell us about yourself",
            level: 2,
          },
        ],
        label: "Adding attendee info",
        placements: [{ id: "attendee-info" }],
        type: "add_layout_elements",
      }).success,
    ).toBe(false);
  });

  test("rejects same-anchor add placements instead of batching into one location", () => {
    const schema = createDefaultFormSchema({ id: "client_intake", name: "Client Intake" });

    expect(() =>
      applyFormSchemaEdit(schema, {
        elements: [
          { id: "first", name: "First", type: "short_text", label: "First" },
          { id: "second", name: "Second", type: "short_text", label: "Second" },
        ],
        label: "Added fields",
        placements: [
          { afterId: "title", id: "first" },
          { afterId: "title", id: "second" },
        ],
        type: "add_fields",
      }),
    ).toThrow("duplicate insertion anchor title");
  });
});

describe("AI edit parsers", () => {
  test("parses streaming edit input previews", () => {
    expect(
      parseFormSchemaEditInputPreview({
        label: "Added email field",
        type: "add_fields",
      }),
    ).toEqual({
      label: "Added email field",
      type: "add_fields",
    });
  });

  test("parses edit tool output", () => {
    expect(
      parseFormSchemaEditOutput({
        operations: [{ label: "Updated form name", target: "title", type: "update" }],
      }),
    ).toEqual({
      operations: [{ label: "Updated form name", target: "title", type: "update" }],
    });
  });

  test("parses legacy edit tool output", () => {
    expect(
      parseFormSchemaEditOutput({
        operation: { label: "Updated form title", target: "title", type: "update" },
      }),
    ).toEqual({
      operations: [{ label: "Updated form title", target: "title", type: "update" }],
    });
  });

  test("parses finish summary output", () => {
    expect(parseFinishFormSchemaEditOutput({ summary: "Client Intake Form is ready." })).toEqual({
      summary: "Client Intake Form is ready.",
    });
  });
});

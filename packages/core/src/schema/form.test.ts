import { describe, expect, it } from "bun:test";
import { compile } from "../compile";
import { createDefaultFormSchema, FormSchema, JsonParse, JsonSerialize } from "./form";

describe("FormSchema", () => {
  it("parses valid schema input", () => {
    const parsed = FormSchema.parse({
      id: "contact_form",
      name: "Contact Form",
      elements: [
        {
          id: "title",
          name: "Title",
          type: "short_text",
          label: "Title",
        },
      ],
    });

    expect(parsed.id).toBe("contact_form");
    expect(parsed.name).toBe("Contact Form");
    expect(parsed.elements).toHaveLength(1);
  });

  it("ignores legacy required shorthand", () => {
    const parsed = FormSchema.parse({
      id: "form_test",
      name: "Test",
      elements: [
        {
          id: "name",
          name: "Name",
          type: "short_text",
          label: "Name",
          required: true,
        },
      ],
    });

    expect(parsed.elements[0]).not.toHaveProperty("rules");
  });

  it("parses radio groups as choice fields", () => {
    const parsed = FormSchema.parse({
      id: "survey",
      name: "Survey",
      elements: [
        {
          id: "satisfaction",
          name: "Satisfaction",
          type: "radio_group",
          label: "How satisfied are you?",
          options: ["Very satisfied", "Satisfied", "Not satisfied"],
          rules: [{ type: "required", value: true }],
        },
      ],
    });

    expect(parsed.elements[0]).toMatchObject({
      category: "field",
      options: ["Very satisfied", "Satisfied", "Not satisfied"],
      type: "radio_group",
    });
  });

  it("parses multi selects as array-valued choice fields", () => {
    const parsed = FormSchema.parse({
      id: "preferences",
      name: "Preferences",
      elements: [
        {
          id: "dietary_extras",
          name: "Dietary extras",
          type: "multi_select",
          label: "Which extras would you like?",
          default: ["Fruit"],
          options: ["Fruit", "Salad", "Dessert"],
          rules: [{ type: "required", value: true }],
        },
      ],
    });

    expect(parsed.elements[0]).toMatchObject({
      category: "field",
      default: ["Fruit"],
      options: ["Fruit", "Salad", "Dessert"],
      type: "multi_select",
    });
  });

  it("rejects invalid multi-select defaults", () => {
    const schema = (defaultValue: unknown) => ({
      id: "preferences",
      name: "Preferences",
      elements: [
        {
          id: "tracks",
          name: "Tracks",
          type: "multi_select" as const,
          label: "Tracks",
          default: defaultValue,
          options: ["Product", "Engineering"],
        },
      ],
    });

    expect(() => FormSchema.parse(schema("Product"))).toThrow(
      "Multi select default must be an array of strings",
    );
    expect(() => FormSchema.parse(schema([1]))).toThrow(
      "Multi select default must be an array of strings",
    );
    expect(() => FormSchema.parse(schema(["Design"]))).toThrow(
      "Multi select default is not a configured option: Design",
    );
    expect(() => FormSchema.parse(schema(["Product", "Product"]))).toThrow(
      "Multi select default must not contain duplicate options",
    );
    expect(() => compile(schema(["Design"]))).toThrow(
      "Multi select default is not a configured option: Design",
    );
  });

  it("parses dates as ISO string fields", () => {
    const parsed = FormSchema.parse({
      id: "event",
      name: "Event",
      elements: [
        {
          id: "start_date",
          name: "Start date",
          type: "date",
          label: "Start date",
          default: "2026-08-19",
          rules: [{ type: "required", value: true }],
        },
      ],
    });

    expect(parsed.elements[0]).toMatchObject({
      category: "field",
      default: "2026-08-19",
      type: "date",
    });
  });

  it("rejects invalid ids", () => {
    expect(() =>
      FormSchema.parse({
        id: "Bad ID!",
        name: "Test",
        elements: [],
      }),
    ).toThrow();
  });

  it("rejects unsupported element types", () => {
    expect(() =>
      FormSchema.parse({
        id: "form_test",
        name: "Test",
        elements: [
          {
            id: "bad",
            name: "Bad",
            type: "unsupported_type",
          },
        ],
      }),
    ).toThrow();
  });
});

describe("createDefaultFormSchema", () => {
  it("creates a valid starter schema", () => {
    const schema = createDefaultFormSchema({ id: "intake", name: "Intake" });

    expect(schema.name).toBe("Intake");
    expect(schema.elements).toHaveLength(1);
    expect(schema.elements[0]).toMatchObject({
      type: "heading",
      label: "Intake",
    });
  });
});

describe("serializeFormSchema", () => {
  it("round-trips stored schema json", () => {
    const schema = createDefaultFormSchema({ id: "intake", name: "Intake" });
    const stored = JsonSerialize(schema);
    const parsed = JsonParse(stored);

    expect(parsed).toEqual(schema);
  });
});

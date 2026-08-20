import { describe, expect, it } from "bun:test";
import {
  createDefaultFormSchema,
  type FormInput,
  FormSchema,
  type FormValues,
  JsonParse,
  JsonSerialize,
} from "./form";

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

  it("parses checkbox groups as multi-choice fields", () => {
    const parsed = FormSchema.parse({
      id: "skills_form",
      name: "Skills",
      elements: [
        {
          id: "skills",
          name: "Skills",
          type: "checkbox_group",
          label: "Which skills do you use?",
          options: ["TypeScript", "React", "Convex"],
          default: ["TypeScript"],
          rules: [{ type: "required", value: true }],
        },
      ],
    });

    expect(parsed.elements[0]).toMatchObject({
      category: "field",
      default: ["TypeScript"],
      options: ["TypeScript", "React", "Convex"],
      type: "checkbox_group",
    });
  });

  it("infers checkbox group submission values as string arrays", () => {
    const schema = {
      id: "skills_form",
      name: "Skills",
      elements: [
        {
          id: "skills",
          name: "Skills",
          type: "checkbox_group",
          label: "Which skills do you use?",
          options: ["TypeScript", "React"],
        },
      ],
    } as const satisfies FormInput;
    const values: FormValues<typeof schema> = { skills: ["TypeScript"] };
    const skills: string[] = values.skills;

    expect(skills).toEqual(["TypeScript"]);
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

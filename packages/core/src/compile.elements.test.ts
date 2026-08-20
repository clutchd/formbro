import { describe, expect, it } from "bun:test";
import { _private } from "./compile";
import { type FormInput, FormSchema } from "./schema/form";

const parseElements = (elements: FormInput["elements"]) =>
  FormSchema.parse({
    id: "test",
    name: "Test",
    elements,
  }).elements;

describe("compile:elements", () => {
  it("returns compiled elements, defaults, events, and field ids", () => {
    const elements = parseElements([
      {
        id: "emailaddress",
        name: "Email Address",
        type: "short_text",
        label: true,
        default: "hello@example.com",
        rules: [
          {
            type: "required",
            value: true,
            event: "onBlur",
          },
          {
            type: "min",
            value: 5,
            event: "onSubmit",
          },
        ],
      },
      {
        id: "fullname",
        name: "Full Name",
        type: "short_text",
        label: false,
      },
      {
        id: "nextstep",
        name: "Next Step",
        type: "page_break",
        label: "Next Step",
      },
    ]);
    const compiled = _private.compileElements(elements);

    expect(compiled.defaults).toEqual({
      emailaddress: "hello@example.com",
      fullname: "",
    });

    expect(compiled.events).toEqual(
      new Map([
        ["emailaddress", ["blur", "submit"]],
        ["fullname", ["submit"]],
      ]),
    );

    expect(compiled.fieldIds).toEqual(new Set(["emailaddress", "fullname"]));

    expect(compiled.validators).toEqual(
      new Map([
        [
          "emailaddress",
          {
            type: "short_text",
            name: "Email Address",
            label: "Email Address",
            rules: {
              onBlur: [
                {
                  type: "required",
                  value: true,
                  event: "onBlur",
                },
              ],
              onSubmit: [
                {
                  type: "min",
                  value: 5,
                  event: "onSubmit",
                },
              ],
            },
          },
        ],
      ]),
    );

    expect(compiled.elements).toMatchObject([
      {
        index: 0,
        id: "emailaddress",
        name: "Email Address",
        type: "short_text",
        category: "field",
        label: "Email Address",
        default: "hello@example.com",
        events: ["blur", "submit"],
        required: true,
      },
      {
        index: 1,
        id: "fullname",
        name: "Full Name",
        type: "short_text",
        category: "field",
        label: undefined,
        default: "",
        events: ["submit"],
        required: false,
      },
      {
        index: 2,
        id: "nextstep",
        name: "Next Step",
        type: "page_break",
        category: "element",
        label: "Next Step",
      },
    ]);
  });

  it("only marks fields as required when the required rule is enabled", () => {
    const elements = parseElements([
      {
        id: "optionalnickname",
        name: "Optional Nickname",
        type: "short_text",
        label: true,
        rules: [
          {
            type: "required",
            value: false,
            event: "onChange",
          },
        ],
      },
      {
        id: "legalname",
        name: "Legal Name",
        type: "short_text",
        label: true,
        rules: [
          {
            type: "required",
            value: true,
            event: "onMount",
          },
        ],
      },
    ]);
    const compiled = _private.compileElements(elements);

    expect(compiled.elements[0]).toMatchObject({
      id: "optionalnickname",
      required: false,
      events: ["change"],
    });

    expect(compiled.elements[1]).toMatchObject({
      id: "legalname",
      required: true,
      events: ["mount"],
    });
  });

  it("uses an empty array as the checkbox group default", () => {
    const elements = parseElements([
      {
        id: "skills",
        name: "Skills",
        type: "checkbox_group",
        label: "Select your skills",
        options: ["TypeScript", "React"],
      },
    ]);

    const compiled = _private.compileElements(elements);

    expect(compiled.defaults).toEqual({ skills: [] });
    expect(compiled.elements[0]).toMatchObject({ default: [], type: "checkbox_group" });
  });

  it("builds validator plans by event and omits fields without rules", () => {
    const elements = parseElements([
      {
        id: "title",
        name: "Title",
        type: "short_text",
        label: false,
        rules: [
          {
            type: "required",
            value: true,
          },
          {
            type: "min",
            value: 3,
            event: "onBlur",
          },
          {
            type: "regex",
            value: "^[a-z]+$",
            event: "onBlur",
          },
        ],
      },
      {
        id: "age",
        name: "Age",
        type: "number",
        label: true,
        rules: [
          {
            type: "min",
            value: 18,
            event: "onSubmit",
          },
          {
            type: "max",
            value: 99,
            event: "onSubmit",
          },
        ],
      },
      {
        id: "notes",
        name: "Notes",
        type: "long_text",
        label: true,
      },
    ]);
    const compiled = _private.compileElements(elements);

    expect(compiled.events).toEqual(
      new Map([
        ["title", ["change", "blur"]],
        ["age", ["submit"]],
        ["notes", ["submit"]],
      ]),
    );

    expect(compiled.validators).toEqual(
      new Map([
        [
          "title",
          {
            type: "short_text",
            name: "Title",
            label: undefined,
            rules: {
              onChange: [
                {
                  type: "required",
                  value: true,
                  event: "onChange",
                },
              ],
              onBlur: [
                {
                  type: "min",
                  value: 3,
                  event: "onBlur",
                },
                {
                  type: "regex",
                  value: "^[a-z]+$",
                  event: "onBlur",
                },
              ],
            },
          },
        ],
        [
          "age",
          {
            type: "number",
            name: "Age",
            label: "Age",
            rules: {
              onSubmit: [
                {
                  type: "min",
                  value: 18,
                  event: "onSubmit",
                },
                {
                  type: "max",
                  value: 99,
                  event: "onSubmit",
                },
              ],
            },
          },
        ],
      ]),
    );
  });

  it("dedupes field events when multiple rules share the same event", () => {
    const elements = parseElements([
      {
        id: "slug",
        name: "Slug",
        type: "short_text",
        label: true,
        rules: [
          {
            type: "min",
            value: 3,
            event: "onBlur",
          },
          {
            type: "max",
            value: 20,
            event: "onBlur",
          },
          {
            type: "regex",
            value: "^[a-z-]+$",
            event: "onSubmit",
          },
        ],
      },
    ]);
    const compiled = _private.compileElements(elements);

    expect(compiled.events.get("slug")).toEqual(["blur", "submit"]);
    expect(compiled.elements[0]).toMatchObject({
      id: "slug",
      events: ["blur", "submit"],
    });
  });

  it("rejects duplicate element ids", () => {
    expect(() =>
      parseElements([
        {
          id: "name",
          name: "Name",
          type: "short_text",
          label: true,
        },
        {
          id: "name",
          name: "Display Name",
          type: "short_text",
          label: true,
        },
      ]),
    ).toThrow("Element id must be unique: name");
  });

  it("rejects invalid element ids", () => {
    expect(() =>
      parseElements([
        {
          id: "Invalid ID",
          name: "Field",
          type: "short_text",
          label: "Field",
        },
      ]),
    ).toThrow("ID must contain only lowercase letters, numbers, and underscores");
  });
});

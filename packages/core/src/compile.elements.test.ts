import { describe, expect, it } from "bun:test";
import { _private } from "./compile";
import { type FormInput, FormSchema } from "./schema/form";

const parseElements = (elements: FormInput["elements"]) =>
  FormSchema.parse({
    name: "Test",
    elements,
  }).elements;

describe("compile:elements", () => {
  it("returns compiled elements, defaults, events, and field ids", () => {
    const elements = parseElements([
      {
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
        name: "Full Name",
        type: "short_text",
        label: false,
      },
      {
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

    expect(compiled.fieldNameToId).toEqual(
      new Map([
        ["Email Address", "emailaddress"],
        ["Full Name", "fullname"],
      ]),
    );

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
        id: "emailaddress",
        index: 0,
        name: "Email Address",
        type: "short_text",
        category: "field",
        label: "Email Address",
        default: "hello@example.com",
        events: ["blur", "submit"],
        required: true,
      },
      {
        id: "fullname",
        index: 1,
        name: "Full Name",
        type: "short_text",
        category: "field",
        label: undefined,
        default: "",
        events: ["submit"],
        required: false,
      },
      {
        id: "nextstep",
        index: 2,
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

  it("builds validator plans by event and omits fields without rules", () => {
    const elements = parseElements([
      {
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

  it("adds deterministic suffixes when field ids collide", () => {
    const elements = parseElements([
      {
        name: "Name",
        type: "short_text",
        label: true,
      },
      {
        name: "Name",
        type: "short_text",
        label: true,
      },
      {
        name: "Name!!!",
        type: "short_text",
        label: true,
      },
    ]);
    const compiled = _private.compileElements(elements);

    expect(compiled.defaults).toEqual({
      name: "",
      name_2: "",
      name_3: "",
    });

    expect(compiled.events).toEqual(
      new Map([
        ["name", ["submit"]],
        ["name_2", ["submit"]],
        ["name_3", ["submit"]],
      ]),
    );

    expect(compiled.elements).toMatchObject([
      { id: "name", name: "Name" },
      { id: "name_2", name: "Name" },
      { id: "name_3", name: "Name!!!" },
    ]);
  });

  it("throws when an element name cannot produce a valid id", () => {
    const elements = parseElements([
      {
        name: "   ",
        type: "short_text",
        label: "Blank",
      },
    ]);

    expect(() => _private.compileElements(elements)).toThrow("ID generation failed for:    ");
  });
});

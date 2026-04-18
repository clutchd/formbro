import { describe, expect, it } from "bun:test";
import { compile, _private } from "./compile";
import { FORMBRO_SCHEMA_VERSION } from "./schema/version";

describe("compile", () => {
  it("interpolates the schema and compiles runtime state", () => {
    const compiled = compile({
      name: "{{company}} Intake",
      version: 2,
      variables: {
        company: "Acme",
        title: "Acme launch",
        email: "hello@example.com",
      },
      submit: {
        label: "Send",
      },
      toasts: {
        success: "Thanks, {{company}}",
        loading: false,
      },
      listeners: [
        {
          source: "Title",
          target: "Slug",
          type: "slugify",
        },
      ],
      elements: [
        {
          name: "Intro",
          type: "heading",
          label: "Welcome to {{company}}",
          level: 2,
        },
        {
          name: "Title",
          type: "short_text",
          label: true,
          default: "{{title}}",
          rules: [
            {
              type: "required",
              value: true,
              event: "onBlur",
            },
          ],
        },
        {
          name: "Slug",
          type: "short_text",
          label: true,
        },
        {
          name: "Next Step",
          type: "page_break",
          label: "Next step",
        },
        {
          name: "Details",
          type: "description",
          label: "Tell us more about {{company}}",
        },
        {
          name: "Email",
          type: "short_text",
          label: true,
          default: "{{email}}",
        },
      ],
    });

    expect(compiled).toMatchObject({
      id: "form_acmeintake",
      version: "2.0.0",
      name: "Acme Intake",
      defaults: {
        title: "Acme launch",
        slug: "",
        email: "hello@example.com",
      },
      toasts: {
        success: "Thanks, Acme",
        error: "An error occurred while submitting the form",
        loading: undefined,
      },
      submit: {
        label: "Send",
      },
    });

    expect(compiled.events).toEqual(
      new Map([
        ["title", ["blur"]],
        ["slug", ["submit"]],
        ["email", ["submit"]],
      ]),
    );

    expect(compiled.listeners).toEqual(
      new Map([
        [
          "title",
          [
            {
              event: "onChange",
              targetId: "slug",
              type: "slugify",
            },
          ],
        ],
      ]),
    );

    expect(compiled.validators).toEqual(
      new Map([
        [
          "title",
          {
            type: "short_text",
            name: "Title",
            label: "Title",
            rules: {
              onBlur: [
                {
                  type: "required",
                  value: true,
                  event: "onBlur",
                },
              ],
            },
          },
        ],
      ]),
    );

    expect(compiled.pages).toHaveLength(2);
    expect(compiled.pages[0]).toMatchObject({
      label: "Next step",
      fieldIds: ["title", "slug"],
    });
    expect(compiled.pages[0]?.sections[0]).toMatchObject({
      header: [
        {
          type: "heading",
          label: "Welcome to Acme",
        },
      ],
      body: [
        {
          id: "title",
        },
        {
          id: "slug",
        },
      ],
    });
    expect(compiled.pages[1]).toMatchObject({
      fieldIds: ["email"],
    });
    expect(compiled.pages[1]?.sections[0]).toMatchObject({
      header: [
        {
          type: "description",
          label: "Tell us more about Acme",
        },
      ],
      body: [
        {
          id: "email",
        },
      ],
    });
  });

  it("throws when a listener source cannot be resolved", () => {
    expect(() =>
      compile({
        name: "Test",
        listeners: [
          {
            source: "Missing",
            target: "Slug",
            type: "slugify",
          },
        ],
        elements: [
          {
            name: "Slug",
            type: "short_text",
            label: true,
          },
        ],
      }),
    ).toThrow("Listener source not found: Missing");
  });

  it("throws when a listener target cannot be resolved", () => {
    expect(() =>
      compile({
        name: "Test",
        listeners: [
          {
            source: "Title",
            target: "Missing",
            type: "uppercase",
          },
        ],
        elements: [
          {
            name: "Title",
            type: "short_text",
            label: true,
          },
        ],
      }),
    ).toThrow("Listener target not found: Missing");
  });

  it("throws when a listener source and target resolve to the same field", () => {
    expect(() =>
      compile({
        name: "Test",
        listeners: [
          {
            source: "Title",
            target: "Title",
            type: "slugify",
          },
        ],
        elements: [
          {
            name: "Title",
            type: "short_text",
            label: true,
          },
        ],
      }),
    ).toThrow("Listener source and target cannot be the same: Title");
  });
});

describe("compile:helpers", () => {
  it("normalizes schema versions", () => {
    expect(compile({ name: "Test", elements: [] }).version).toBe(FORMBRO_SCHEMA_VERSION);
    expect(_private.compileVersion("")).toBe(FORMBRO_SCHEMA_VERSION);
    expect(_private.compileVersion(3)).toBe("3.0.0");
    expect(_private.compileVersion("3.2")).toBe("3.2.0");
    expect(_private.compileVersion("3.2.1.9")).toBe("3.2.1");
  });

  it("builds default and partial toast configs", () => {
    expect(_private.compileToasts(true)).toEqual({
      success: "Form submitted successfully!",
      error: "An error occurred while submitting the form",
      loading: "Submitting Form...",
    });

    expect(
      _private.compileToasts({
        success: "Done",
        error: false,
      }),
    ).toEqual({
      success: "Done",
      error: undefined,
      loading: "Submitting Form...",
    });

    expect(_private.compileToasts(undefined)).toBeUndefined();
  });
});

import { describe, expect, it } from "bun:test";
import { compile, _private } from "./compile";
import { FORMBRO_SCHEMA_VERSION } from "./schema/version";

describe("compile", () => {
  it("interpolates the schema and compiles runtime state", () => {
    const compiled = compile({
      id: "intake",
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
          source: "title",
          target: "slug",
          type: "slugify",
        },
      ],
      elements: [
        {
          id: "intro",
          name: "Intro",
          type: "heading",
          label: "Welcome to {{company}}",
          level: 2,
        },
        {
          id: "title",
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
          id: "slug",
          name: "Slug",
          type: "short_text",
          label: true,
        },
        {
          id: "nextstep",
          name: "Next Step",
          type: "page_break",
          label: "Next step",
        },
        {
          id: "details",
          name: "Details",
          type: "description",
          label: "Tell us more about {{company}}",
        },
        {
          id: "email",
          name: "Email",
          type: "short_text",
          label: true,
          default: "{{email}}",
        },
      ],
    });

    expect(compiled).toMatchObject({
      id: "intake",
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
      label: undefined,
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
      label: "Next step",
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
        id: "test",
        name: "Test",
        listeners: [
          {
            source: "missing",
            target: "slug",
            type: "slugify",
          },
        ],
        elements: [
          {
            id: "slug",
            name: "Slug",
            type: "short_text",
            label: true,
          },
        ],
      }),
    ).toThrow("Listener source not found: missing");
  });

  it("throws when a listener target cannot be resolved", () => {
    expect(() =>
      compile({
        id: "test",
        name: "Test",
        listeners: [
          {
            source: "title",
            target: "missing",
            type: "uppercase",
          },
        ],
        elements: [
          {
            id: "title",
            name: "Title",
            type: "short_text",
            label: true,
          },
        ],
      }),
    ).toThrow("Listener target not found: missing");
  });

  it("throws when a listener source and target resolve to the same field", () => {
    expect(() =>
      compile({
        id: "test",
        name: "Test",
        listeners: [
          {
            source: "title",
            target: "title",
            type: "slugify",
          },
        ],
        elements: [
          {
            id: "title",
            name: "Title",
            type: "short_text",
            label: true,
          },
        ],
      }),
    ).toThrow("Listener source and target cannot be the same: title");
  });
});

describe("compile:helpers", () => {
  it("normalizes schema versions", () => {
    expect(compile({ id: "test", name: "Test", elements: [] }).version).toBe(
      FORMBRO_SCHEMA_VERSION,
    );
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

import { describe, expect, it } from "bun:test";
import { compile, _private } from "./compile.js";

describe("compile:id", () => {
  it("uses authored form and element ids without deriving them from names", () => {
    const compiled = compile({
      id: "contact_form",
      name: "Contact Form",
      elements: [
        {
          id: "email",
          name: "Email Address",
          type: "short_text",
        },
      ],
    });

    expect(compiled.id).toBe("contact_form");
    expect(compiled.defaults).toEqual({
      email: "",
    });
  });

  it("keeps ids stable when display properties change", () => {
    const base = compile({
      id: "contact_form",
      name: "Contact Form",
      elements: [
        {
          id: "email",
          name: "Email Address",
          type: "short_text",
          label: "Email",
        },
      ],
    });
    const renamed = compile({
      id: "contact_form",
      name: "Renamed Form",
      elements: [
        {
          id: "email",
          name: "Work Email",
          type: "short_text",
          label: "Work email address",
        },
      ],
    });

    expect(renamed.id).toBe(base.id);
    expect(renamed.defaults).toEqual(base.defaults);
    expect(renamed.pages[0]?.fieldIds).toEqual(base.pages[0]?.fieldIds);
  });

  it("does not interpolate ids", () => {
    const interpolated = _private.interpolate(
      {
        id: "{{company}}_form",
        name: "{{company}} Form",
        elements: [
          {
            id: "{{company}}_email",
            name: "{{company}} Email",
          },
        ],
      },
      { company: "acme" },
    );

    expect(interpolated.id).toBe("{{company}}_form");
    expect(interpolated.name).toBe("acme Form");
    expect(interpolated.elements[0]?.id).toBe("{{company}}_email");
    expect(interpolated.elements[0]?.name).toBe("acme Email");
  });
});

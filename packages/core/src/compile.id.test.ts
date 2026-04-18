import { describe, expect, it } from "bun:test";
import { _private } from "./compile";

describe("compile:id", () => {
  it("slugify lowercases and strips non-alphanumeric characters", () => {
    expect(_private.slugify("Hello World")).toBe("helloworld");
    expect(_private.slugify("My_Form-Name 123")).toBe("myformname123");
    expect(_private.slugify("AlreadyClean")).toBe("alreadyclean");
  });

  it("prefixes the slugified name when building ids", () => {
    expect(_private.id({ prefix: "form", name: "Contact Form" })).toBe("form_contactform");
    expect(_private.id({ prefix: "field", name: "Email Address" })).toBe("field_emailaddress");
  });

  it("does not prefix the name when no prefix is provided", () => {
    expect(_private.id({ name: "Contact Form" })).toBe("contactform");
    expect(_private.id({ name: "Email Address" })).toBe("emailaddress");
  });

  it("throws when the slugified name is empty", () => {
    expect(() => _private.id({ prefix: "form", name: "!!!" })).toThrow(
      "ID generation failed for: form_!!!",
    );
  });
});

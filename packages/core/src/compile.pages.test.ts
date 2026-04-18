import { describe, expect, it } from "bun:test";
import { _private } from "./compile";
import { type FormInput, FormSchema } from "./schema/form";

const parseElements = (elements: FormInput["elements"]) =>
  FormSchema.parse({
    name: "Test",
    elements,
  }).elements;

const compilePages = (elements: FormInput["elements"]) =>
  _private.compilePages(_private.compileElements(parseElements(elements)).elements);

describe("compile:pages", () => {
  it("returns single page for form without page breaks", () => {
    const pages = compilePages([
      { name: "Email", type: "short_text" },
      { name: "Name", type: "short_text" },
    ]);

    expect(pages).toHaveLength(1);
    expect(pages[0]?.elements).toHaveLength(2);
  });

  it("should split form at page_break elements", () => {
    const pages = compilePages([
      { name: "Email", type: "short_text" },
      { name: "Break", type: "page_break" },
      { name: "Name", type: "short_text" },
    ]);

    expect(pages).toHaveLength(2);
    expect(pages[0]?.elements).toHaveLength(1);
    expect(pages[1]?.elements).toHaveLength(1);
  });

  it("should handle multiple page breaks", () => {
    const pages = compilePages([
      { name: "Field1", type: "short_text" },
      { name: "Break1", type: "page_break" },
      { name: "Field2", type: "short_text" },
      { name: "Break2", type: "page_break" },
      { name: "Field3", type: "short_text" },
    ]);

    expect(pages).toHaveLength(3);
    expect(pages[0]?.elements).toHaveLength(1);
    expect(pages[1]?.elements).toHaveLength(1);
    expect(pages[2]?.elements).toHaveLength(1);
  });

  it("should not include page_break in page elements", () => {
    const pages = compilePages([
      { name: "Email", type: "short_text" },
      { name: "Break", type: "page_break" },
      { name: "Name", type: "short_text" },
    ]);

    for (const page of pages) {
      for (const element of page.elements) {
        expect(element.type).not.toBe("page_break");
      }
    }
  });

  it("should preserve page_break label as page label", () => {
    const pages = compilePages([
      { name: "Email", type: "short_text" },
      {
        name: "Contact Info",
        type: "page_break",
        label: "Contact Info",
      },
      { name: "Name", type: "short_text" },
    ]);

    expect(pages[0]?.label).toBe("Contact Info");
  });

  it("should handle empty elements array", () => {
    const pages = compilePages([]);

    expect(pages).toHaveLength(1);
    expect(pages[0]?.elements).toHaveLength(0);
  });

  it("should handle page_break at start", () => {
    const pages = compilePages([
      { name: "Break", type: "page_break" },
      { name: "Email", type: "short_text" },
    ]);

    expect(pages).toHaveLength(1);
    expect(pages[0]?.elements).toHaveLength(1);
  });

  it("should handle page_break at end", () => {
    const pages = compilePages([
      { name: "Email", type: "short_text" },
      { name: "Break", type: "page_break" },
    ]);

    expect(pages).toHaveLength(1);
    expect(pages[0]?.elements).toHaveLength(1);
  });

  it("should handle consecutive page breaks", () => {
    const pages = compilePages([
      { name: "Field1", type: "short_text" },
      { name: "Break1", type: "page_break" },
      { name: "Break2", type: "page_break" },
      { name: "Field2", type: "short_text" },
    ]);
    expect(pages).toHaveLength(2);
  });

  it("should return original elements when only page_break elements exist", () => {
    const pages = compilePages([
      { name: "Break1", type: "page_break" },
      { name: "Break2", type: "page_break" },
    ]);

    expect(pages).toHaveLength(1);
    expect(pages[0]?.elements).toHaveLength(0);
  });

  it("should preserve all element properties", () => {
    const pages = compilePages([
      {
        name: "Email",
        type: "short_text",
        label: "Your Email",
        description: "Enter your email address",
        placeholder: "email@example.com",
      },
    ]);
    const firstField = pages[0]?.elements[0];

    expect(firstField?.name).toBe("Email");
    expect(firstField?.type).toBe("short_text");
  });

  it("should group headings into section headers", () => {
    const pages = compilePages([
      {
        name: "Intro",
        type: "heading",
        label: "Intro",
      },
      { name: "Email", type: "short_text" },
    ]);

    expect(pages[0]?.sections).toHaveLength(1);
    expect(pages[0]?.sections[0]?.header).toHaveLength(1);
    expect(pages[0]?.sections[0]?.header[0]?.type).toBe("heading");
    expect(pages[0]?.sections[0]?.body).toHaveLength(1);
    expect(pages[0]?.sections[0]?.body[0]?.type).toBe("short_text");
  });

  it("should start a new section when description follows fields", () => {
    const pages = compilePages([
      { name: "Email", type: "short_text" },
      {
        name: "Help",
        type: "description",
        label: "Helpful copy",
      },
      { name: "Name", type: "short_text" },
    ]);

    expect(pages[0]?.sections).toHaveLength(2);
    expect(pages[0]?.sections[0]?.body).toHaveLength(1);
    expect(pages[0]?.sections[0]?.header).toHaveLength(0);
    expect(pages[0]?.sections[1]?.header).toHaveLength(1);
    expect(pages[0]?.sections[1]?.header[0]?.type).toBe("description");
    expect(pages[0]?.sections[1]?.body).toHaveLength(1);
  });

  it("should attach dividers as section separators", () => {
    const pages = compilePages([
      { name: "Email", type: "short_text" },
      { name: "Divider", type: "divider" },
      { name: "Name", type: "short_text" },
    ]);

    expect(pages[0]?.sections).toHaveLength(2);
    expect(pages[0]?.sections[0]?.separator?.type).toBe("divider");
    expect(pages[0]?.sections[1]?.body).toHaveLength(1);
    expect(pages[0]?.sections[1]?.body[0]?.type).toBe("short_text");
  });
});

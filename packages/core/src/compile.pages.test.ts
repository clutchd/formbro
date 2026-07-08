import { describe, expect, it } from "bun:test";
import { _private } from "./compile.js";
import { type FormInput, FormSchema } from "./schema/form.js";

const parseElements = (elements: FormInput["elements"]) =>
  FormSchema.parse({
    id: "test",
    name: "Test",
    elements,
  }).elements;

const compilePages = (elements: FormInput["elements"]) =>
  _private.compilePages(_private.compileElements(parseElements(elements)).elements);

describe("compile:pages", () => {
  it("returns single page for form without page breaks", () => {
    const pages = compilePages([
      { id: "email", name: "Email", type: "short_text" },
      { id: "name", name: "Name", type: "short_text" },
    ]);

    expect(pages).toHaveLength(1);
    expect(pages[0]?.elements).toHaveLength(2);
  });

  it("should split form at page_break elements", () => {
    const pages = compilePages([
      { id: "email", name: "Email", type: "short_text" },
      { id: "break", name: "Break", type: "page_break" },
      { id: "name", name: "Name", type: "short_text" },
    ]);

    expect(pages).toHaveLength(2);
    expect(pages[0]?.elements).toHaveLength(1);
    expect(pages[1]?.elements).toHaveLength(1);
  });

  it("should handle multiple page breaks", () => {
    const pages = compilePages([
      { id: "field1", name: "Field1", type: "short_text" },
      { id: "break1", name: "Break1", type: "page_break" },
      { id: "field2", name: "Field2", type: "short_text" },
      { id: "break2", name: "Break2", type: "page_break" },
      { id: "field3", name: "Field3", type: "short_text" },
    ]);

    expect(pages).toHaveLength(3);
    expect(pages[0]?.elements).toHaveLength(1);
    expect(pages[1]?.elements).toHaveLength(1);
    expect(pages[2]?.elements).toHaveLength(1);
  });

  it("should not include page_break in page elements", () => {
    const pages = compilePages([
      { id: "email", name: "Email", type: "short_text" },
      { id: "break", name: "Break", type: "page_break" },
      { id: "name", name: "Name", type: "short_text" },
    ]);

    for (const page of pages) {
      for (const element of page.elements) {
        expect(element.type).not.toBe("page_break");
      }
    }
  });

  it("should preserve page_break label as the next page label", () => {
    const pages = compilePages([
      { id: "email", name: "Email", type: "short_text" },
      {
        id: "contactinfo",
        name: "Contact Info",
        type: "page_break",
        label: "Contact Info",
      },
      { id: "name", name: "Name", type: "short_text" },
    ]);

    expect(pages[0]?.label).toBeUndefined();
    expect(pages[1]?.label).toBe("Contact Info");
  });

  it("should handle empty elements array", () => {
    const pages = compilePages([]);

    expect(pages).toHaveLength(1);
    expect(pages[0]?.elements).toHaveLength(0);
  });

  it("should handle page_break at start", () => {
    const pages = compilePages([
      { id: "break", name: "Break", type: "page_break", label: "First page" },
      { id: "email", name: "Email", type: "short_text" },
    ]);

    expect(pages).toHaveLength(1);
    expect(pages[0]?.label).toBe("First page");
    expect(pages[0]?.elements).toHaveLength(1);
  });

  it("should handle page_break at end", () => {
    const pages = compilePages([
      { id: "email", name: "Email", type: "short_text" },
      { id: "break", name: "Break", type: "page_break" },
    ]);

    expect(pages).toHaveLength(1);
    expect(pages[0]?.elements).toHaveLength(1);
  });

  it("should handle consecutive page breaks", () => {
    const pages = compilePages([
      { id: "field1", name: "Field1", type: "short_text" },
      { id: "break1", name: "Break1", type: "page_break" },
      { id: "break2", name: "Break2", type: "page_break" },
      { id: "field2", name: "Field2", type: "short_text" },
    ]);
    expect(pages).toHaveLength(2);
  });

  it("should return original elements when only page_break elements exist", () => {
    const pages = compilePages([
      { id: "break1", name: "Break1", type: "page_break" },
      { id: "break2", name: "Break2", type: "page_break" },
    ]);

    expect(pages).toHaveLength(1);
    expect(pages[0]?.elements).toHaveLength(0);
  });

  it("should preserve all element properties", () => {
    const pages = compilePages([
      {
        id: "email",
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
        id: "intro",
        name: "Intro",
        type: "heading",
        label: "Intro",
      },
      { id: "email", name: "Email", type: "short_text" },
    ]);

    expect(pages[0]?.sections).toHaveLength(1);
    expect(pages[0]?.sections[0]?.header).toHaveLength(1);
    expect(pages[0]?.sections[0]?.header[0]?.type).toBe("heading");
    expect(pages[0]?.sections[0]?.body).toHaveLength(1);
    expect(pages[0]?.sections[0]?.body[0]?.type).toBe("short_text");
  });

  it("should start a new section when description follows fields", () => {
    const pages = compilePages([
      { id: "email", name: "Email", type: "short_text" },
      {
        id: "help",
        name: "Help",
        type: "description",
        label: "Helpful copy",
      },
      { id: "name", name: "Name", type: "short_text" },
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
      { id: "email", name: "Email", type: "short_text" },
      { id: "divider", name: "Divider", type: "divider" },
      { id: "name", name: "Name", type: "short_text" },
    ]);

    expect(pages[0]?.sections).toHaveLength(2);
    expect(pages[0]?.sections[0]?.separator?.type).toBe("divider");
    expect(pages[0]?.sections[1]?.body).toHaveLength(1);
    expect(pages[0]?.sections[1]?.body[0]?.type).toBe("short_text");
  });
});

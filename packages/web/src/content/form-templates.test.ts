import { describe, expect, test } from "bun:test";
import { FORM_TEMPLATES, getFormTemplate } from "./form-templates";

describe("form template registry", () => {
  test("uses unique, resolvable slugs", () => {
    const slugs = FORM_TEMPLATES.map((template) => template.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(getFormTemplate(slug)?.slug).toBe(slug);
    }
  });

  test("has substantive, search-ready content", () => {
    for (const template of FORM_TEMPLATES) {
      expect(template.metaDescription.length).toBeGreaterThanOrEqual(120);
      expect(template.metaDescription.length).toBeLessThanOrEqual(170);
      expect(template.fields.length).toBeGreaterThanOrEqual(5);
      expect(template.workflow).toHaveLength(3);
      expect(template.faqs).toHaveLength(3);
    }
  });

  test("only links to existing templates", () => {
    for (const template of FORM_TEMPLATES) {
      expect(template.relatedSlugs).not.toContain(template.slug);
      for (const relatedSlug of template.relatedSlugs) {
        expect(getFormTemplate(relatedSlug)).toBeDefined();
      }
    }
  });
});

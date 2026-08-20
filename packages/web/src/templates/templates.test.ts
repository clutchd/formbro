import { FormSchema } from "@formbro/core/schema/form";
import { describe, expect, it } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { TEMPLATE_DEFINITIONS } from "./catalog";
import {
  getTemplate,
  getTemplateCategoryPage,
  instantiateTemplate,
  listTemplates,
  TEMPLATE_CATEGORIES,
  templateCategoryLabel,
  templateCategoryPath,
  templatePageDescription,
  templatePageTitle,
  templatePath,
} from "./index";

describe("templates catalog", () => {
  it("loads every template as a valid FormBro form", () => {
    expect(TEMPLATE_DEFINITIONS).toHaveLength(24);

    const ids = new Set<string>();
    for (const definition of TEMPLATE_DEFINITIONS) {
      expect(ids.has(definition.id)).toBe(false);
      ids.add(definition.id);

      const template = getTemplate(definition.id);
      expect(template).toBeDefined();
      if (!template) continue;

      expect(() => FormSchema.parse(template.schema)).not.toThrow();
      expect(template.schema.id).toBe(definition.id);
      expect(template.schema.id).toBe(definition.schema.id);
      expect(template.name).toBe(definition.schema.name);
      expect(template.version).toBe(definition.version);
      expect(definition.version).toBeGreaterThanOrEqual(1);
      expect(template.fieldCount).toBeGreaterThan(0);
      expect(template.pageCount).toBeGreaterThan(0);
    }
  });

  it("keeps one form file per registered template", () => {
    const files = readdirSync(join(import.meta.dir, "specs"))
      .filter((file) => file.endsWith(".ts"))
      .sort();
    const expected = TEMPLATE_DEFINITIONS.map(
      (definition) => `${definition.id.replaceAll("_", "-")}.ts`,
    ).sort();
    expect(files).toEqual(expected);
  });

  it("lists featured templates first", () => {
    const cards = listTemplates();
    const featuredCount = cards.filter((card) => card.featured).length;

    expect(featuredCount).toBeGreaterThan(0);
    expect(cards.slice(0, featuredCount).every((card) => card.featured)).toBe(true);
    expect(cards.slice(featuredCount).every((card) => !card.featured)).toBe(true);
  });

  it("filters by category and query", () => {
    const registration = listTemplates({ category: "registration" });
    expect(registration.length).toBeGreaterThan(0);
    expect(registration.every((card) => card.categories.includes("registration"))).toBe(true);

    const vendor = listTemplates({ query: "vendor" });
    expect(vendor.map((card) => card.id)).toContain("vendor_registration");
    expect(listTemplates({ query: "zzzz-missing" })).toEqual([]);
  });

  it("instantiates a template onto a new form id", () => {
    const schema = instantiateTemplate("vendor_registration", {
      formId: "abc123xyz0",
      name: "Spring vendors",
    });

    expect(schema).toBeDefined();
    expect(schema?.id).toBe("abc123xyz0");
    expect(schema?.name).toBe("Spring vendors");
    expect(schema?.elements.some((element) => element.id === "org_name")).toBe(true);
  });

  it("returns undefined for an unknown template", () => {
    expect(getTemplate("missing")).toBeUndefined();
    expect(instantiateTemplate("missing", { formId: "abc123xyz0" })).toBeUndefined();
  });

  it("labels every category", () => {
    for (const category of TEMPLATE_CATEGORIES) {
      expect(templateCategoryLabel(category).length).toBeGreaterThan(0);
      expect(getTemplateCategoryPage(category)?.slug).toBe(category);
      expect(templateCategoryPath(category)).toBe(`/templates/category/${category}`);
    }
  });

  it("lists a template on every category page it belongs to", () => {
    const eventPages = listTemplates({ category: "event-registration" });
    expect(eventPages.map((card) => card.id)).toContain("workshop_registration");
    expect(eventPages.map((card) => card.id)).toContain("vendor_registration");

    const orderPages = listTemplates({ category: "order-form" });
    expect(orderPages.map((card) => card.id)).toContain("purchase_request");
    expect(orderPages.every((card) => card.categories.includes("order-form"))).toBe(true);
  });

  it("builds public template slugs", () => {
    expect(templatePath("vendor_registration")).toBe("/templates/vendor-registration");
    expect(templateCategoryPath("event-registration")).toBe(
      "/templates/category/event-registration",
    );
  });

  it("builds intent-matched page titles and descriptions for every template", () => {
    expect(templatePageTitle("Contact")).toBe("Contact form template");
    expect(templatePageTitle("Job Application")).toBe("Job application form template");
    expect(templatePageTitle("Event Registration")).toBe("Event registration form template");
    expect(templatePageTitle("IT Request")).toBe("IT request form template");

    for (const template of listTemplates()) {
      const title = templatePageTitle(template.name);
      const description = templatePageDescription(template);

      expect(title).toEndWith(" form template");
      expect(description.toLocaleLowerCase()).toContain(title.toLocaleLowerCase());
      expect(description).toContain(template.description);
      expect(description.length).toBeLessThanOrEqual(160);
    }
  });
});

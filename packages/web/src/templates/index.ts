import { isFieldRegistryType } from "@formbro/core/schema/editor";
import { FormSchema, type FormOutput } from "@formbro/core/schema/form";
import type {
  FormTemplate,
  ListTemplatesFilter,
  TemplateCard,
  TemplateCategory,
  TemplateDefinition,
  TemplateIndustry,
} from "./types";
import { TEMPLATE_DEFINITIONS } from "./catalog";
import { TEMPLATE_INDUSTRY_PAGES } from "./industries";
import { TEMPLATE_CATEGORIES, TEMPLATE_INDUSTRIES } from "./types";

export { TEMPLATE_CATEGORY_PAGES, getTemplateCategoryPage } from "./categories";
export type { TemplateCategoryPage } from "./categories";
export { TEMPLATE_INDUSTRY_PAGES, getTemplateIndustryPage } from "./industries";
export type { TemplateIndustryPage } from "./industries";
export { TEMPLATE_CATEGORIES, TEMPLATE_INDUSTRIES } from "./types";
export type {
  FormTemplate,
  ListTemplatesFilter,
  TemplateCard,
  TemplateCategory,
  TemplateDefinition,
  TemplateIndustry,
} from "./types";

function loadTemplate(definition: TemplateDefinition): FormTemplate {
  if (!Number.isInteger(definition.version) || definition.version < 1) {
    throw new Error(`Template "${definition.id}" is missing a positive version`);
  }

  const schema = FormSchema.parse(definition.schema);
  if (schema.id !== definition.id) {
    throw new Error(`Template "${definition.id}" schema id must match the template id`);
  }

  return {
    id: definition.id,
    version: definition.version,
    name: schema.name,
    description: definition.description,
    category: definition.category,
    categories: definition.categories ?? [definition.category],
    tags: definition.tags,
    featured: definition.featured === true,
    fieldCount: schema.elements.filter((element) => isFieldRegistryType(element.type)).length,
    pageCount: 1 + schema.elements.filter((element) => element.type === "page_break").length,
    schema,
  };
}

const TEMPLATES: readonly FormTemplate[] = TEMPLATE_DEFINITIONS.map(loadTemplate);

const TEMPLATES_BY_ID = new Map(TEMPLATES.map((template) => [template.id, template]));

export function templateCategoryLabel(category: TemplateCategory): string {
  switch (category) {
    case "intake":
      return "Intake";
    case "registration":
      return "Registration";
    case "event-registration":
      return "Event registration";
    case "order-form":
      return "Order";
    case "request":
      return "Request";
    case "application":
      return "Application";
    case "inquiry":
      return "Inquiry";
    case "feedback":
      return "Feedback";
    default: {
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
}

export function templateIndustryLabel(industry: TemplateIndustry): string {
  return TEMPLATE_INDUSTRY_PAGES[industry].label;
}

function toCard(template: FormTemplate): TemplateCard {
  return {
    id: template.id,
    version: template.version,
    name: template.name,
    description: template.description,
    category: template.category,
    categories: template.categories,
    tags: template.tags,
    featured: template.featured,
    fieldCount: template.fieldCount,
    pageCount: template.pageCount,
  };
}

function matchesQuery(template: FormTemplate, query: string) {
  const haystack = [template.name, template.description, ...template.categories, ...template.tags]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function listTemplates(filter: ListTemplatesFilter = {}): TemplateCard[] {
  const category = filter.category ?? "all";
  const industryIds = filter.industry
    ? new Set(TEMPLATE_INDUSTRY_PAGES[filter.industry].templateIds)
    : undefined;
  const query = filter.query?.trim().toLowerCase();

  return TEMPLATES.filter((template) => {
    if (category !== "all" && !template.categories.includes(category)) return false;
    if (industryIds && !industryIds.has(template.id)) return false;
    if (query && !matchesQuery(template, query)) return false;
    return true;
  })
    .slice()
    .sort((left, right) => {
      if (left.featured !== right.featured) return left.featured ? -1 : 1;
      return left.name.localeCompare(right.name);
    })
    .map(toCard);
}

export function getTemplate(id: string): FormTemplate | undefined {
  return TEMPLATES_BY_ID.get(id);
}

export function templateSlug(id: string) {
  return id.replaceAll("_", "-");
}

export function templateIdFromSlug(slug: string) {
  return slug.replaceAll("-", "_");
}

export function templatePath(id: string) {
  return `/templates/${templateSlug(id)}`;
}

export function templateCategoryPath(category: TemplateCategory) {
  return `/templates/category/${category}`;
}

export function templateIndustryPath(industry: TemplateIndustry) {
  return `/templates/industry/${industry}`;
}

export function isTemplateCategory(value: string): value is TemplateCategory {
  return (TEMPLATE_CATEGORIES as readonly string[]).includes(value);
}

export function isTemplateIndustry(value: string): value is TemplateIndustry {
  return (TEMPLATE_INDUSTRIES as readonly string[]).includes(value);
}

export function instantiateTemplate(
  id: string,
  { formId, name }: { formId: string; name?: string },
): FormOutput | undefined {
  const template = getTemplate(id);
  if (!template) return undefined;
  return FormSchema.parse({
    ...template.schema,
    id: formId,
    name: name?.trim() || template.name,
  });
}

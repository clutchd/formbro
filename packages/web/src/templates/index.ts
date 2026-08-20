import { isFieldRegistryType } from "@formbro/core/schema/editor";
import { FormSchema, type FormOutput } from "@formbro/core/schema/form";
import type {
  FormTemplate,
  ListTemplatesFilter,
  TemplateCard,
  TemplateCategory,
  TemplateDefinition,
} from "./types";
import { TEMPLATE_DEFINITIONS } from "./catalog";
import { TEMPLATE_CATEGORIES } from "./types";

export { TEMPLATE_CATEGORY_PAGES, getTemplateCategoryPage } from "./categories";
export type { TemplateCategoryPage } from "./categories";
export { TEMPLATE_CATEGORIES } from "./types";
export type {
  FormTemplate,
  ListTemplatesFilter,
  TemplateCard,
  TemplateCategory,
  TemplateDefinition,
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
  const haystack = [template.name, template.description, template.category, ...template.tags]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function listTemplates(filter: ListTemplatesFilter = {}): TemplateCard[] {
  const category = filter.category ?? "all";
  const query = filter.query?.trim().toLowerCase();

  return TEMPLATES.filter((template) => {
    if (category !== "all" && !template.categories.includes(category)) return false;
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

function sentenceCaseTemplateName(name: string) {
  return name
    .split(" ")
    .map((word, index) => {
      if (index === 0 || /^[A-Z\d]+$/.test(word)) return word;
      return word.toLocaleLowerCase();
    })
    .join(" ");
}

export function templatePageTitle(name: string) {
  return `${sentenceCaseTemplateName(name)} form template`;
}

export function templatePageDescription(template: Pick<FormTemplate, "name" | "description">) {
  const title = templatePageTitle(template.name);
  const [firstWord = "", ...rest] = title.split(" ");
  const sentenceTitle = [
    /^[A-Z\d]+$/.test(firstWord) ? firstWord : firstWord.toLocaleLowerCase(),
    ...rest,
  ].join(" ");

  return `Use this ${sentenceTitle}. ${template.description} Preview and customize it in FormBro.`;
}

export function templateCategoryPath(category: TemplateCategory) {
  return `/templates/category/${category}`;
}

export function isTemplateCategory(value: string): value is TemplateCategory {
  return (TEMPLATE_CATEGORIES as readonly string[]).includes(value);
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

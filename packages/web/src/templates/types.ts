import type { FormInput, FormOutput } from "@formbro/core/schema/form";

export const TEMPLATE_CATEGORIES = [
  "intake",
  "registration",
  "event-registration",
  "order-form",
  "request",
  "application",
  "inquiry",
  "feedback",
] as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export type TemplateDefinition = {
  id: string;
  version: number;
  description: string;
  category: TemplateCategory;
  categories?: TemplateCategory[];
  tags: string[];
  featured?: boolean;
  schema: FormInput;
};

export type TemplateCard = {
  id: string;
  version: number;
  name: string;
  description: string;
  category: TemplateCategory;
  categories: TemplateCategory[];
  tags: string[];
  featured: boolean;
  fieldCount: number;
  pageCount: number;
};

export type FormTemplate = TemplateCard & {
  schema: FormOutput;
};

export type ListTemplatesFilter = {
  category?: TemplateCategory | "all";
  query?: string;
};

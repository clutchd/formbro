import type { MetadataRoute } from "next";
import { APP_URL } from "@formbro/shared/brand";
import {
  listTemplates,
  TEMPLATE_CATEGORIES,
  templateCategoryPath,
  templatePath,
} from "@/templates";

export default function sitemap(): MetadataRoute.Sitemap {
  const categoryRoutes = TEMPLATE_CATEGORIES.map((category) => ({
    url: new URL(templateCategoryPath(category), APP_URL).href,
  }));
  const templateRoutes = listTemplates().map((template) => ({
    url: new URL(templatePath(template.id), APP_URL).href,
  }));

  return [
    { url: new URL("/", APP_URL).href },
    { url: new URL("/templates", APP_URL).href },
    ...categoryRoutes,
    ...templateRoutes,
  ];
}

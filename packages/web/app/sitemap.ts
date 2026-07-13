import type { MetadataRoute } from "next";
import { APP_URL } from "@formbro/shared/brand";
import { FORM_TEMPLATES } from "@/content/form-templates";

const LAST_MEANINGFUL_UPDATE = new Date("2026-07-13");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: APP_URL,
      lastModified: LAST_MEANINGFUL_UPDATE,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/templates", APP_URL).toString(),
      lastModified: LAST_MEANINGFUL_UPDATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...FORM_TEMPLATES.map((template) => ({
      url: new URL(`/templates/${template.slug}`, APP_URL).toString(),
      lastModified: LAST_MEANINGFUL_UPDATE,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}

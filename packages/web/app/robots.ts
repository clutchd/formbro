import type { MetadataRoute } from "next";
import { APP_URL } from "@formbro/shared/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/f/",
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}

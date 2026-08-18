import type { MetadataRoute } from "next";
import { APP_URL } from "@formbro/shared/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: new URL("/", APP_URL).href }];
}

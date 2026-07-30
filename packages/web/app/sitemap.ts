import { APP_URL } from "@formbro/shared/brand";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: new URL("/", APP_URL).href }];
}

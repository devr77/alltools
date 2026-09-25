import type { MetadataRoute } from "next";
import { site, tools } from "./catalog";

/** Share pages at their canonical URLs, for the sitemap of whichever host is canonical (domain.ts). */
export function shareSitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...tools.map((tool) => ({ url: `${site.url}/${tool.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}

import type { MetadataRoute } from "next";
import { site, tools } from "./catalog";

// Served at /share/sitemap.xml, and as /sitemap.xml on the dedicated share domain (middleware.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...tools.map((tool) => ({
      url: `${site.url}/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

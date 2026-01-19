import type { MetadataRoute } from "next";
import { categories } from "./Constants";

const BASE_URL = "https://toolsbase.org";

export default function sitemap(): MetadataRoute.Sitemap {
  // Static sitemap links
  const staticLinks = [
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date("2026-01-17"),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date("2026-01-17"),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date("2026-01-17"),
      changeFrequency: "yearly",
      priority: 0.8,
    },
  ];

  // Flatten all tool slugs from categories
  const toolUrls = categories.flatMap((category) =>
    category.tools.map((tool) => `/${category.slug}/${tool.slug}`),
  );

  // Add category-level URLs
  const categoryUrls = categories.map((category) => `/${category.slug}`);

  // Combine all URLs
  const dynamicUrls = [
    "/", // Home page
    ...categoryUrls,
    ...toolUrls,
  ];

  const dynamicSitemap = dynamicUrls.map((url) => ({
    url: `${BASE_URL}${url}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: url === "/" ? 1 : 0.7,
  }));

  return [...staticLinks, ...dynamicSitemap];
}

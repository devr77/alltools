import type { MetadataRoute } from "next";
import { CANONICAL_ON_DOMAIN } from "../share/domain";
import { shareSitemap } from "../share/seo";

// /sitemap.xml on the share domain (middleware.ts). Empty when toolsbase.org/share is the canonical copy.
export default function sitemap(): MetadataRoute.Sitemap {
  return CANONICAL_ON_DOMAIN ? shareSitemap() : [];
}

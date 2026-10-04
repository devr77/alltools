import type { MetadataRoute } from "next";
import { CANONICAL_ON_DOMAIN } from "../hls/domain";
import { hlsSitemap } from "../hls/seo";

// /sitemap.xml on the HLS domain (middleware.ts). Empty when toolsbase.org/hls is the canonical copy.
export default function sitemap(): MetadataRoute.Sitemap {
  return CANONICAL_ON_DOMAIN ? hlsSitemap() : [];
}

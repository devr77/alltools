import { HLS_URL } from "../../hls/domain";

// /robots.txt on the HLS domain, which middleware.ts rewrites here.
// (Next's robots.ts convention only works at the app root, which belongs to the main site.)
export const dynamic = "force-static";

export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${HLS_URL}/sitemap.xml\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

import { SHARE_URL } from "../../share/domain";

// /robots.txt on the share domain, which middleware.ts rewrites here.
// (Next's robots.ts convention only works at the app root, which belongs to the main site.)
export const dynamic = "force-static";

export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SHARE_URL}/sitemap.xml\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

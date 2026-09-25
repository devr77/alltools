import { site } from "../catalog";

// robots.txt for the dedicated share domain, which proxy.ts rewrites /robots.txt to.
// (Next's robots.ts convention only works at the app root, which belongs to the main site.)
export const dynamic = "force-static";

export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

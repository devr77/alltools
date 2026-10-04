import { NextResponse, type NextRequest } from "next/server";
import { SHARE_HOST } from "./app/share/domain";
import { HLS_HOST } from "./app/hls/domain";

/**
 * middleware.ts, not Next 16's proxy.ts: proxy always runs on Node.js, and Cloudflare Pages (@cloudflare/next-on-pages)
 * only accepts the Edge runtime, which middleware uses by default.
 *
 * Share and HLS are each served on toolsbase.org and, optionally, at the root of their own domain, without redirects:
 *   toolsbase.org/share/<x>   -> app/share (untouched)
 *   share domain /<x>         -> app/share-domain/<x> (rewrite; includes /robots.txt and /sitemap.xml)
 *   share domain /share/<x>   -> app/share (untouched, so old /share links keep working there too)
 * and the same for /hls, app/hls-domain, and the HLS domain.
 * The *-domain trees are internal: other hosts get a 404 for them. Canonical tags on both copies point to one URL (domain.ts).
 */
const sections = [
  { host: SHARE_HOST, base: "/share", internal: "/share-domain" },
  { host: HLS_HOST, base: "/hls", internal: "/hls-domain" },
];

const within = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const internal = sections.some((section) => within(pathname, section.internal));
  const host = request.headers.get("host");
  const section = sections.find((entry) => entry.host !== "" && entry.host === host);

  if (section && !internal && !within(pathname, section.base)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? section.internal : `${section.internal}${pathname}`;
    return NextResponse.rewrite(url);
  }
  if (internal) return new NextResponse("Not found", { status: 404 });
  return NextResponse.next();
}

export const config = {
  // Page paths only: build assets, API routes, and public files (anything with an extension) pass straight through,
  // except the SEO files the section domains serve from app/*-domain.
  matcher: ["/((?!_next/|api/|.*\\.[^/]+$).*)", "/robots.txt", "/sitemap.xml", "/share-domain/:path*", "/hls-domain/:path*"],
};

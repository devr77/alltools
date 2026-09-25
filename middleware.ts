import { NextResponse, type NextRequest } from "next/server";
import { SHARE_HOST } from "./app/share/domain";

/**
 * middleware.ts, not Next 16's proxy.ts: proxy always runs on Node.js, and Cloudflare Pages (@cloudflare/next-on-pages)
 * only accepts the Edge runtime, which middleware uses by default.
 *
 * Share is served on both hosts without redirects:
 *   toolsbase.org/share/<x>   -> app/share (untouched)
 *   share domain /<x>         -> app/share-domain/<x> (rewrite; includes /robots.txt and /sitemap.xml)
 *   share domain /share/<x>   -> app/share (untouched, so old /share links keep working there too)
 * app/share-domain is internal: other hosts get a 404 for it. Canonical tags on both copies point to one URL (domain.ts).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const internal = pathname === "/share-domain" || pathname.startsWith("/share-domain/");
  const onShareHost = SHARE_HOST !== "" && request.headers.get("host") === SHARE_HOST;

  if (onShareHost && !internal && pathname !== "/share" && !pathname.startsWith("/share/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/share-domain" : `/share-domain${pathname}`;
    return NextResponse.rewrite(url);
  }
  if (internal) return new NextResponse("Not found", { status: 404 });
  return NextResponse.next();
}

export const config = {
  // Page paths only: build assets, API routes, and public files (anything with an extension) pass straight through,
  // except the SEO files the share domain serves from app/share-domain.
  matcher: ["/((?!_next/|api/|.*\\.[^/]+$).*)", "/robots.txt", "/sitemap.xml", "/share-domain/:path*"],
};

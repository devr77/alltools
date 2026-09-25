import { NextResponse, type NextRequest } from "next/server";
import { SHARE_HOST, SHARE_URL } from "./app/share/domain";

/**
 * middleware.ts, not Next 16's proxy.ts: proxy always runs on Node.js, and Cloudflare Pages (@cloudflare/next-on-pages)
 * only accepts the Edge runtime, which middleware uses by default.
 *
 * Serves app/share at the root of its own domain when NEXT_PUBLIC_SHARE_URL is set (see app/share/domain.ts).
 *   share domain:   /            -> /share (rewrite)      /robots.txt  -> /share/robots.txt
 *                   /<tool>      -> /share/<tool>         /sitemap.xml -> /share/sitemap.xml
 *                   /share/<x>   -> /<x> (308, one clean URL per page)
 *   other domains:  /share/<x>   -> share domain /<x> (308, so link equity moves to the canonical URLs)
 */
export function middleware(request: NextRequest) {
  if (!SHARE_HOST) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  const underShare = pathname === "/share" || pathname.startsWith("/share/");
  const stripped = underShare ? pathname.slice("/share".length) || "/" : pathname;

  if (request.headers.get("host") === SHARE_HOST) {
    if (underShare) return NextResponse.redirect(new URL(stripped + search, SHARE_URL), 308);
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/share" : `/share${pathname}`;
    return NextResponse.rewrite(url);
  }
  if (underShare) return NextResponse.redirect(new URL(stripped + search, SHARE_URL), 308);
  return NextResponse.next();
}

export const config = {
  // Page paths only: build assets, API routes, and public files (anything with an extension) pass straight through,
  // except the two SEO files the share domain serves from app/share.
  matcher: ["/((?!_next/|api/|.*\\.[^/]+$).*)", "/robots.txt", "/sitemap.xml", "/share/robots.txt", "/share/sitemap.xml"],
};

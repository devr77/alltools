/**
 * Where the Share section is served. Imported by middleware.ts, so keep it free of heavy imports.
 * Share is always at toolsbase.org/share (app/share). Set NEXT_PUBLIC_SHARE_URL (e.g. https://hearttalk.network) at build
 * time to also serve it at the root of its own domain: middleware.ts rewrites that domain's paths onto app/share-domain.
 */
export const MAIN_URL = "https://toolsbase.org";
export const SHARE_URL = process.env.NEXT_PUBLIC_SHARE_URL?.trim().replace(/\/+$/, "") || "";
export const SHARE_HOST = SHARE_URL ? new URL(SHARE_URL).host : "";

// The one address search engines should index, used by canonical tags, JSON-LD, and sitemaps on both hosts.
// Change to `${MAIN_URL}/share` to make toolsbase.org/share the indexed copy instead.
export const CANONICAL_URL = SHARE_URL || `${MAIN_URL}/share`;
export const CANONICAL_ON_DOMAIN = CANONICAL_URL === SHARE_URL;

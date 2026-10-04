/**
 * Where the HLS section is served. Imported by middleware.ts, so keep it free of heavy imports.
 * HLS is always at toolsbase.org/hls (app/hls). Set NEXT_PUBLIC_HLS_URL (e.g. https://hlstools.example) at build time
 * to also serve it at the root of its own domain: middleware.ts rewrites that domain's paths onto app/hls-domain.
 */
export const MAIN_URL = "https://toolsbase.org";
export const HLS_URL = process.env.NEXT_PUBLIC_HLS_URL?.trim().replace(/\/+$/, "") || "";
export const HLS_HOST = HLS_URL ? new URL(HLS_URL).host : "";

// The one address search engines should index, used by canonical tags, JSON-LD, and sitemaps on both hosts.
// Change to `${MAIN_URL}/hls` to make toolsbase.org/hls the indexed copy instead.
export const CANONICAL_URL = HLS_URL || `${MAIN_URL}/hls`;
export const CANONICAL_ON_DOMAIN = CANONICAL_URL === HLS_URL;

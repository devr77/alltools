/**
 * Where the Share section is served. Imported by middleware.ts, so keep it free of heavy imports.
 * Set NEXT_PUBLIC_SHARE_URL (e.g. https://share.toolsbase.org) at build time to serve Share at the root of its own domain:
 * middleware.ts maps that domain's paths onto app/share and redirects toolsbase.org/share/* there.
 * Leave it unset to serve Share at toolsbase.org/share.
 */
export const MAIN_URL = "https://toolsbase.org";
export const SHARE_URL = process.env.NEXT_PUBLIC_SHARE_URL?.trim().replace(/\/+$/, "") || "";
export const SHARE_HOST = SHARE_URL ? new URL(SHARE_URL).host : "";

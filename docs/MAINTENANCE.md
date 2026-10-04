# ToolsBase maintenance guide

Updated September 24, 2026. See [verification](VERIFICATION.md) for checks actually performed. The torrent and hashing tools are a separate static site; see [torrent/README.md](../torrent/README.md).

## Local development

Use Node.js 22 LTS and the committed npm lockfile. Install with `npm ci`, then run `npm run dev` and open `http://localhost:3000`. Run `npm run build` followed by `npm start` to inspect a production build. The frontend is Next.js App Router, React, TypeScript, CSS modules, and Tailwind. The Python helper under `scripts/` is separate from the Next.js application.

Commands:

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

TypeScript validation is enabled in production builds. Do not add `ignoreBuildErrors` to hide failures. Repository-wide lint can expose older code outside the refreshed features; the focused command in the verification record checks the new implementation. Run dependent build/typecheck commands sequentially if generated `.next/types` files are changing.

## Where to change things

| File | Responsibility |
| --- | --- |
| `app/Constants.ts` | Main category/tool catalog; imported by home, menus, category pages, and sitemap |
| `app/(site)/Home.tsx`, `app/(site)/Home.module.css` | Compact hero, featured tools, search, category filtering, tool directory |
| `app/layout.tsx` | Base metadata and analytics wrappers |
| `app/(site)/layout.tsx` | Main site header, main area, and footer for every page except `/share` and `/hls` |
| `app/globals.css` | Existing light-theme colors, base type size, common tool controls and content width |
| `app/components/SiteHeader.tsx`, `MobileSidebar.tsx` | Desktop navigation and mobile navigation dialog |
| `app/components/SiteFooter.tsx`, `SiteFooter.module.css` | Shared responsive footer and policy/contact links |
| `app/components/CategoryDirectory.tsx` | Shared category introduction and tool cards |
| `app/components/ToolLayout.tsx`, `ToolLayout.module.css` | Breadcrumbs, tool panel, feedback, sharing, related tools |
| `app/sitemap.ts` | Sitemap generated from the shared catalog |
| `next.config.ts` | Redirects, including `/torrent` and `/torrent/:tool` to the standalone torrent site |
| `app/share/`, `app/share-domain/` | Share section (temporary links), with its own layout; see the README |
| `app/hls/`, `app/hls-domain/` | HLS section (stream download, playback, inspection, TS to MP4), with its own layout; see [HLS tools](#hls-tools) |
| `middleware.ts` | Serves Share and HLS at the root of their optional own domains (`NEXT_PUBLIC_SHARE_URL`, `NEXT_PUBLIC_HLS_URL`) |
| `torrent/` | Standalone static torrent site (not part of the Next.js build); see its README |

The category layouts use `ToolLayout`. Their category indexes use `CategoryDirectory`. Existing tool implementations remain inside those shared layouts. About, contact, and privacy pages use the shared information panel style.

## Design and typography

[DESIGN.md](DESIGN.md) is the single design reference for colors, typography, spacing, layouts, navigation, accessibility, and disclaimer placement. Update it whenever the visual system changes; keep implementation and operational details in this maintenance guide.

## Search and adding tools

Home search uses Fuse over tool names, category names, and optional `keywords`. It supports Cmd/Ctrl+K, Escape, suggested queries, and a resettable empty state. Search ignores field length when ranking so long natural-language alias lists do not bury relevant tools. Result counts come from the actual filtered list. Search analytics are debounced by 400ms.

For a normal tool:

1. Add a unique slug, name, icon, and useful description to its category in `app/Constants.ts`.
2. Create `app/(site)/<category>/<slug>/page.tsx`. Keep metadata in the server page and browser interactions in a client component.
3. Use the category layout; do not duplicate site navigation, footer, or related-tool blocks.
4. Give the page a descriptive H1 and labels for inputs. Include empty, invalid, working, successful, and reset states where applicable.
5. Verify the category card, home search, mobile menu, sitemap URL, and direct route.

Avoid duplicate tools for spelling variations or search phrases. Add accurate search aliases instead. Torrent tools are added in `torrent/` (see its README), not here. Share and HLS tools are added in their own catalogs (`app/share/catalog.ts`, `app/hls/catalog.ts`).

## HLS tools

`app/hls/` is a self-contained section in the same shape as Share: `HlsShell.tsx` (header, footer, acceptable-use notice), `HubPage.tsx` and `ToolPage.tsx` (shared by `app/hls` and `app/hls-domain`), `catalog.ts` (all page copy), `sections.tsx` (page sections and the tool panel), and `hls.css` (its own theme, scoped to `.hls-root`, light and dark). It imports nothing from Share or the main site.

| Tool | Client component | What it does |
| --- | --- | --- |
| `hls-downloader` | `Downloader.tsx` | Loads a master or media playlist, lists qualities and separate audio tracks, downloads every segment, and saves one MP4 or TS file |
| `m3u8-player` | `Player.tsx` | Plays a stream with hls.js (Safari native HLS as a fallback), with quality locking and readable errors |
| `m3u8-checker` | `Checker.tsx` | Shows variants, renditions, segment facts, warnings, and the raw playlist; can load every variant |
| `ts-to-mp4` | `TsConverter.tsx` | Rewraps local `.ts` files (one or many, natural name order) into one MP4 |

The engine is in `app/hls/lib/`: `m3u8.ts` (parser and helpers, no browser APIs), `download.ts` (fetching with retries, byte ranges, AES-128 decryption with Web Crypto, and the downloader that fetches six segments at a time but writes them in order), `remux.ts` (container detection and output assembly), and `format.ts`. Tools hand a stream to each other with `?url=`, read once on mount by `useStreamParam` in `UrlForm.tsx`.

Behavior and limits to keep in mind:

- Everything runs in the visitor's browser. There is no proxy, so the stream's server must allow cross-origin reads (CORS); errors say so. Adding a proxy would make ToolsBase relay third-party video, with bandwidth and legal consequences, so don't add one casually.
- DRM is refused, not worked around: SAMPLE-AES, Widevine, FairPlay, and PlayReady streams fail with a message. Only unencrypted streams and AES-128 with a reachable key are supported.
- TS to MP4 uses mux.js (lazy-loaded) and supports H.264 with AAC only; other codecs fall back to TS with a message. fMP4 (`EXT-X-MAP`) streams are joined as they are. A discontinuity starts a fresh mux.js transmuxer at the end time of the previous output, because mux.js applies `baseMediaDecodeTime` only to tracks it hasn't seen yet.
- Live playlists download only the segments listed when the download starts. Downloads are assembled as Blob parts in browser storage, so very long streams depend on the browser's limits.
- The sample stream is Mux's public Big Buck Bunny test stream (CC BY, CORS enabled), `SAMPLE_STREAM` in `UrlForm.tsx`. Replace it if that URL stops working.
- Analytics events (`hls_*`) never include stream URLs or file names.

`tests/hls.test.mjs` covers the parser, IV derivation, container sniffing, naming, and catalog completeness. Before a release, also try the tools in a browser against a few streams: plain TS, AES-128, fMP4, byte ranges, a discontinuity, a blocked (no CORS) server, and the sample stream. Play the saved files and check their length.

## Configuration, analytics, and privacy

AI tools use server-only `GROQ_API_KEY`, falling back to the existing `NEXT_GROQ_KEY`. Set `GROQ_MODEL` to override the default `openai/gpt-oss-20b` with a chat model available to your Groq account. Restart the development server after environment changes; configure the same variables on your deployment host. The API returns JSON errors for invalid input, missing credentials, unavailable models, rate limits, and upstream failures, with a 30-second provider timeout. PostHog uses `NEXT_PUBLIC_POSTHOG_KEY` and optional `NEXT_PUBLIC_POSTHOG_HOST` in `app/provider.tsx`. Google Tag Manager is configured in the root layout. Public-prefixed variables are included in client bundles: never place server secrets there. Keep `.env` files and credentials out of source control and documentation.

The site has analytics, so do not describe the entire website as making no network requests. Use `ph-no-capture ph-mask` on sensitive input/result panels to exclude them from PostHog automatic capture/replay. Do not add explicit analytics events containing local file contents or names. Homepage `tool_search` and tool feedback are separate existing product analytics behaviors; review analytics settings and privacy text when changing them.

## SEO and deployment

`app/layout.tsx` sets the canonical domain through `metadataBase`. `app/sitemap.ts` includes static pages, category paths, and tool paths. Counts should come from the registry instead of unsupported marketing claims.

Build and deploy using the hosting platform's Next.js support. `npm run builds` is an existing Cloudflare adapter command, not the same as `npm run build`; this work verified the standard Next.js production build, not that adapter or a deployment. Confirm compatibility with the target host before deploying. No deployment was performed.

The `/torrent` redirects in `next.config.ts` are temporary (307) and point at `https://devr77.github.io/alltools/torrent/`. Update the `TORRENT_SITE` constant if the torrent site moves, for example to a custom domain.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| New tool missing from search/menu | Catalog entry, category slug, and unique tool slug |
| DOCX converter API failure | Current flow is Mammoth HTML conversion followed by Turndown, not deprecated `convertToMarkdown` |
| Duplicate footer or cramped tool layout | Confirm only root layout owns footer and category wrapper owns panel |

See [verification](VERIFICATION.md) for a repeatable release checklist and the distinction between automated tests, browser smoke checks, and untested external integrations.

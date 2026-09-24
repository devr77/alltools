# ToolsBase maintenance guide

Updated September 24, 2026. See [torrent tools](TORRENT_TOOLS.md) for protocol details and [verification](VERIFICATION.md) for checks actually performed.

## Local development

Use Node.js 22 LTS and the committed npm lockfile. Install with `npm ci`, then run `npm run dev` and open `http://localhost:3000`. Run `npm run build` followed by `npm start` to inspect a production build. The frontend is Next.js App Router, React, TypeScript, CSS modules, and Tailwind. The Python helper under `scripts/` is separate from the Next.js application and is not required by the torrent tools.

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
| `app/Home.tsx`, `app/Home.module.css` | Compact hero, featured tools, search, category filtering, tool directory |
| `app/layout.tsx` | One site header, main area, footer, base metadata, and analytics wrappers |
| `app/globals.css` | Existing light-theme colors, base type size, common tool controls and content width |
| `app/components/SiteHeader.tsx`, `MobileSidebar.tsx` | Desktop navigation and mobile navigation dialog |
| `app/components/SiteFooter.tsx`, `SiteFooter.module.css` | Shared responsive footer and policy/contact links |
| `app/components/CategoryDirectory.tsx` | Shared category introduction and tool cards |
| `app/components/ToolLayout.tsx`, `ToolLayout.module.css` | Breadcrumbs, tool panel, feedback, sharing, related tools |
| `app/torrent/tools.ts` | Torrent catalog, descriptions, help text, search aliases, calculator routing list |
| `app/torrent/[tool]/page.tsx` | Torrent route validation, static paths, metadata, and component selection |
| `app/torrent/Torrent.module.css` | Torrent category, forms, results, calculators, and downloader layout |
| `app/lib/torrent.ts` | Binary-safe torrent parsing, creating, hashing, and magnet utilities |
| `app/lib/torrent-calculators.ts` | Pure calculation and name generation functions |
| `app/lib/browser-torrent.ts` | Lazy WebTorrent loader, temporary chunk storage, downloader size limit |
| `app/sitemap.ts` | Sitemap generated from the shared catalog |

The seven non-torrent category layouts use `ToolLayout`. Their category indexes use `CategoryDirectory`. Existing tool implementations remain inside those shared layouts. The torrent workspace uses its own form/results layout. About, contact, and privacy pages use the shared information panel style.

## Design and typography

[DESIGN.md](DESIGN.md) is the single design reference for colors, typography, spacing, layouts, navigation, accessibility, and disclaimer placement. Update it whenever the visual system changes; keep implementation and operational details in this maintenance guide.

## Search and adding tools

Home search uses Fuse over tool names, category names, and optional `keywords`. It supports Cmd/Ctrl+K, Escape, suggested queries, and a resettable empty state. Search ignores field length when ranking so long natural-language alias lists do not bury relevant tools. Result counts come from the actual filtered list. Search analytics are debounced by 400ms.

For a normal tool:

1. Add a unique slug, name, icon, and useful description to its category in `app/Constants.ts`.
2. Create `app/<category>/<slug>/page.tsx`. Keep metadata in the server page and browser interactions in a client component.
3. Use the category layout; do not duplicate site navigation, footer, or related-tool blocks.
4. Give the page a descriptive H1 and labels for inputs. Include empty, invalid, working, successful, and reset states where applicable.
5. Verify the category card, home search, mobile menu, sitemap URL, and direct route.

For a torrent tool, add the catalog entry to `app/torrent/tools.ts`, then wire its behavior into the route dispatcher. Add calculator slugs to `calculatorSlugs` and implement their UI in `TorrentCalculator.tsx`; keep math in `torrent-calculators.ts`. Metadata tools use `TorrentTool.tsx`; connected tools use `BrowserTorrentTool.tsx`. The shared registry automatically feeds home/menu/category/sitemap listings. Unknown torrent slugs return 404. Do not add a listing without implemented behavior.

Avoid duplicate tools for spelling variations or search phrases. Add accurate search aliases instead. A torrent is metadata, so MP4/PDF search intent is handled by retrieving and filtering original files, with an explanation that no format conversion occurs.

## Configuration, analytics, and privacy

Torrent tools require no API key or server torrent daemon. Local metadata tools and calculators perform their processing in the browser. Connected downloader/health tools contact trackers and peers only when the user starts them; the local sample uses a same-origin web seed.

AI tools use server-only `GROQ_API_KEY`, falling back to the existing `NEXT_GROQ_KEY`. Set `GROQ_MODEL` to override the default `openai/gpt-oss-20b` with a chat model available to your Groq account. Restart the development server after environment changes; configure the same variables on your deployment host. The API returns JSON errors for invalid input, missing credentials, unavailable models, rate limits, and upstream failures, with a 30-second provider timeout. PostHog uses `NEXT_PUBLIC_POSTHOG_KEY` and optional `NEXT_PUBLIC_POSTHOG_HOST` in `app/provider.tsx`. Google Tag Manager is configured in the root layout. Public-prefixed variables are included in client bundles: never place server secrets there. Keep `.env` files and credentials out of source control and documentation.

The site has analytics, so do not describe the entire website as making no network requests. Torrent forms use `ph-no-capture ph-mask` to exclude their content from PostHog automatic capture/replay. Keep these classes on sensitive input/result panels. Do not add explicit analytics events containing magnet links, torrent metadata, local file contents, or names. Homepage `tool_search` and tool feedback are separate existing product analytics behaviors; review analytics settings and privacy text when changing them.

## SEO and deployment

`app/layout.tsx` sets the canonical domain through `metadataBase`. Torrent pages generate titles, descriptions, and canonical URLs from their registry entries. `app/sitemap.ts` includes static pages, category paths, and tool paths. Counts should come from the registry instead of unsupported marketing claims.

Build and deploy using the hosting platform's Next.js support. `npm run builds` is an existing Cloudflare adapter command, not the same as `npm run build`; this work verified the standard Next.js production build, not that adapter or a deployment. Confirm compatibility with the target host before deploying. No deployment was performed.

Serve the browser downloader over HTTPS (localhost is allowed). Preserve `/vendor/webtorrent-3.0.21.min.js` as a JavaScript asset and `/torrent-demo/readme.txt` as the exact sample bytes. A restrictive CSP must account for the connections the selected trackers, WebRTC transport, and web seeds need. Never disable browser security protections to work around a failed download.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| New tool missing from search/menu | Catalog entry, category slug, and unique tool slug |
| Torrent route returns 404 | Registry and route dispatcher; restart/rebuild after changes |
| Hashing unavailable | HTTPS/localhost and Web Crypto support |
| Downloader waits for metadata | Compatible WebRTC seeders, reachable WSS tracker, or use a `.torrent` file |
| Web seed fails | Original matching content, CORS, byte ranges, HTTPS, correct multi-file URL layout |
| File has finished but is gone after leaving | Storage is temporary; save before stopping/closing |
| Health checker reports no peers | Inconclusive for TCP-only swarms; compare in a desktop client |
| Large download rejected | 256 MiB browser torrent limit; use a desktop client |
| DOCX converter API failure | Current flow is Mammoth HTML conversion followed by Turndown, not deprecated `convertToMarkdown` |
| Duplicate footer or cramped tool layout | Confirm only root layout owns footer and category wrapper owns panel |

See [verification](VERIFICATION.md) for a repeatable release checklist and the distinction between automated tests, browser smoke checks, and untested external integrations.

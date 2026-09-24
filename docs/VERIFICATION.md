# Verification record

Updated September 24, 2026. This records checks completed during the original implementation, before the later removal of five tools; it is not a claim that every existing tool or external service was exhaustively tested.

## Automated checks

| Check | Result |
| --- | --- |
| `npm test` | 36 tests passed; zero failures/skips |
| `npm run typecheck` | Passed |
| Focused ESLint command below | Passed |
| `npm run build` | Passed; generated 90 static pages, including all 16 torrent paths |

```sh
npx eslint app/Home.tsx app/components/ToolLayout.tsx app/components/CategoryDirectory.tsx app/components/SiteHeader.tsx app/components/MobileSidebar.tsx app/components/SiteFooter.tsx app/lib app/torrent app/sitemap.ts tests
```

The production build reported the existing edge-runtime/static-generation notice and a Node module API deprecation warning; neither failed the build. Repository-wide lint has older unrelated debt and is not represented by the focused lint result above. Build success is not a deployment verification.

Tests in `tests/torrent.test.mjs` cover independent hash/Base32 vectors, binary bencode, exact info-dictionary hashing, malformed input, parser bounds, single/multi-file metadata, traversal rejection, creator piece boundaries, empty files, private metadata, cancellation, and byte formatting. Tests in `tests/torrent-calculators.test.mjs` cover unit conversion, formulas, validation/overflow, measurement medians, filename sanitation, memory chunk-store behavior, and agreement between the demo source and served bytes.

## Browser checks completed

- Compact homepage, featured cards, category filters, search, empty state, and footer were checked in Chrome during this implementation.
- Mobile layouts at 390 × 844 were inspected. Homepage, torrent directory, JSON formatter, UUID generator, QR generator, about, and contact had no horizontal document overflow in the checked state. The first featured homepage cards were visible without scrolling past a large hero.
- The five original metadata/hash workflows were exercised, including malformed hashes, Base32 extraction, copy, result clearing, file upload, creation, parsing, and metadata download.
- A generated two-file torrent containing 81 bytes was saved and parsed again. The resulting info hash matched `e5b8bc222efa9d114f0d0defc580d36ea9b07db0`, and the downloaded JSON matched its file list and sizes.
- Each of the seven calculator/generator forms produced results. Examples: 10 GB at 100 Mbps and 85% efficiency yielded 15m 42s; speed conversion yielded 10.63 MB/s, 10.13 MiB/s, and 38.25 GB/hour; default storage planning yielded 480 GB and $9.60/month.
- The real browser torrent engine downloaded the same-origin sample to 100%, verified its piece hash, and saved `readme.txt`. The downloaded 250-byte file was compared byte-for-byte with `public/torrent-demo/readme.txt` and matched. The sample uses no public tracker or swarm.
- Stop cleared the browser torrent session. A 30-second health check with no connections returned an explicitly inconclusive result and closed its connections.
- Search for “torrent file to mp4” returned related torrent tools. Search ranking was subsequently adjusted with Fuse's `ignoreFieldNorm` setting; that final ranking adjustment was type/lint/build checked but not rechecked in the browser.

The final mobile navigation Link/ARIA/focus changes passed lint, typecheck, and build. Their final keyboard interaction was not rechecked in the browser after Chrome became unavailable in the resumed environment.

## Remaining environment coverage

The controlled sample verifies actual HTTP web-seed retrieval through WebTorrent, piece verification, and saving. It does **not** verify arbitrary internet swarms. External WebRTC transfers, all trackers, Safari/Firefox behavior, large-memory behavior, cloud-provider deployment, the Cloudflare adapter, and production CSP remain environment-specific checks. Browser limitations are described in the UI and [torrent guide](TORRENT_TOOLS.md).

The shared visual design applies across existing category/tool layouts. Existing AI provider, URL-fetching, PDF, and other external integrations were not all exercised. The DOCX conversion API compatibility fix passed the production build; no document-format fidelity audit was performed.

## Repeatable release smoke checklist

1. Run unit tests, typecheck, focused lint, and production build.
2. Open homepage at desktop and mobile widths. Check visible first tools, search aliases, category filters, empty state, keyboard search shortcut, and footer links.
3. Open/close mobile navigation with pointer and keyboard. Verify Escape, focus trapping, restored trigger focus, and category expansion.
4. Open each category and a representative existing tool. Confirm title, panel, controls, related links, and no horizontal overflow.
5. Create a small multi-file torrent, save it, re-upload it to parser/BTIH tools, and compare expected hashes/files. Try malformed inputs and reset while checking that stale results disappear.
6. Run every calculator, change its units, exercise invalid inputs, and copy/download the result where offered.
7. Start the browser downloader's sample, wait for completion, save and compare bytes, then stop. Verify leaving the page closes the connection and temporary storage.
8. In a controlled WebRTC test swarm, verify metadata retrieval, per-file selection including shared boundary pieces, completion/save, and stop. Do not use unrelated private user files for test uploads/seeding.
9. Check health checker with a known compatible seeder and with no peers. Ensure the latter stays inconclusive rather than reporting a dead torrent.
10. Verify production HTTPS, vendor module MIME/path, sample bytes, sitemap entries, canonical URLs, and unknown-tool 404 before publishing.

# Torrent and hashing tools

Updated September 24, 2026. There are 15 torrent routes: the original five tools are implemented, with 10 additional utilities. The existing magnet generator is reused rather than duplicated.

## Shared use disclaimer

Every torrent page inherits a visible “Terms of use & educational disclaimer” from `app/torrent/layout.tsx`. It explains lawful, educational, and open-source data management purposes, permitted content, user responsibility for laws/licenses, and the limits of results. Keep this shared notice in the layout so future tools inherit the same wording. It supplements the specific connection and browser-limit notices within each connected tool.

## Tool reference

All paths below start with `/torrent/`.

| Route | How to use it | Result and limits |
| --- | --- | --- |
| `magnet-link-generator` | Enter a 40-character hexadecimal or 32-character Base32 v1 info hash; optionally add name and trackers | Encoded magnet link; does not find or download content |
| `btih-hash-generator` | Choose a `.torrent` file | SHA-1 of the exact original info dictionary, in hex and Base32 |
| `torrent-file-parser` | Choose a `.torrent` file | File list, sizes, piece metadata, trackers, info hash, downloadable metadata JSON |
| `torrent-file-creator` | Select local files; choose name, piece size, trackers, and optional private flag | Downloadable v1 `.torrent`; requires a separate client with the originals to seed |
| `info-hash-extractor` | Paste a magnet or choose a `.torrent` | Normalized hexadecimal and Base32 v1 identifier |
| `torrent-download-time-calculator` | Enter total size, speed, efficiency, and completed percentage | Remaining size and estimated duration |
| `torrent-health-checker` | Supply a public magnet/torrent and WSS tracker; start check | Real 30-second browser peer observation; no global seed count or malware verdict |
| `internet-to-torrent-speed-converter` | Choose connection rate/unit and efficiency | Decimal MB/s, binary MiB/s, and decimal GB/hour |
| `video-file-size-reduction-estimator` | Enter duration, target video/audio bitrates, original size, and container overhead | Estimated output size and savings; negative savings indicate growth; no encoding |
| `torrent-to-direct-download` | Connect, select original files, wait for verification, then save | Same real browser engine as the downloader; no permanent hosted URL |
| `storage-requirement-calculator` | Enter originals, extracted-data multiplier, backups, headroom, and optional price | Required decimal GB and estimated monthly storage cost |
| `isp-throttling-detector` | Enter 3–20 direct, VPN, and reference Mbps measurements per group | Median comparison and cautious interpretation; displayed as ISP Throttling Comparison |
| `torrent-naming-standard-generator` | Enter title and optional release details; select movie/TV/general | Sanitized conventional name, including `SxxExx` for TV; copy/download text |
| `browser-torrent-downloader` | Paste magnet or upload torrent, connect, select files, save when complete | Actual downloads from WebRTC peers or accessible HTTP web seeds; 256 MiB total torrent limit |
| `torrent-file-to-magnet` | Upload a `.torrent` | Locally generated magnet including info hash, name, and trackers |

## Browser downloader walkthrough

1. Open `/torrent/browser-torrent-downloader` on HTTPS or localhost.
2. To verify the engine without a public swarm, click **Try a small sample**. The tool creates metadata for a known 250-byte text file, downloads the file from this site's HTTP web seed, and verifies its torrent piece hash. Save the completed `readme.txt`.
3. For your own public torrent, select magnet or `.torrent` input. Review the visible additional tracker field; its default is `wss://tracker.openwebtorrent.com`. Remove or replace it if desired. It is contacted only after starting.
4. An optional web seed must host the original matching content and allow CORS and byte-range requests. It is not an arbitrary video/document URL converter.
5. Click **Connect to torrent**. When metadata arrives, select files. No payload files are selected automatically for ordinary downloads.
6. Watch connected peers, download speed, elapsed time, selected-content progress, and each file's completion state. Save is available only after a file is complete.
7. Save the files you want, then **Stop & clear session**. Stopping, navigating away, or closing the page closes the client and clears temporary chunks. Browser-saved files remain on your device.

The engine can share verified pieces while connected, capped at 256 KiB/s upload. Trackers and peers receive connection information and the torrent identifier. The application displays this before connection. Private torrents are rejected by the browser tool; use the private tracker's supported client workflow.

Downloads are held in memory. The total torrent limit is 256 MiB even when selecting only a subset, and temporary copies/browser overhead can use more memory than the file size. There is no persistent resume, server relay, account storage, or background download after the page closes. The health checker selects no payload files and disables web seeds.

If no metadata arrives within 60 seconds, the downloader stops with an actionable message. A lack of compatible peers after 30 seconds produces a waiting warning. Health checks end after 30 seconds; zero connections are explicitly inconclusive.

## What “torrent to MP4/PDF/direct download” means

A `.torrent` contains metadata describing other files. It does not contain the original MP4, PDF, or other content. This implementation retrieves actual content through the torrent engine, then lets the user filter the file list for original MP4 or PDF files. It does not transcode video, convert a document, rename extensions to simulate conversion, or manufacture a permanent HTTP download link.

Browsers cannot connect directly to ordinary TCP/UDP-only BitTorrent peers. A swarm active in a desktop client may have no browser-compatible peers. Successful browser retrieval needs WebRTC-compatible seeders discovered through compatible trackers, or matching accessible web seeds. Use a desktop client for large or incompatible torrents. The direct-download tool is functional within these constraints; there is no fake success screen or funnel.

## Metadata implementation and limits

`app/lib/torrent.ts` implements binary-safe bencode and v1 torrent operations without a server dependency. SHA-1 uses Web Crypto. The BTIH is computed over the original info dictionary byte span, not the whole `.torrent` file and not a reconstructed dictionary. Binary piece hashes must never pass through a text decoder. Outer metadata changes therefore do not alter the info hash.

The parser validates canonical bencoding, dictionary ordering/duplicates, integer syntax, truncation, trailing bytes, sizes, piece lengths/counts, duplicate paths, and traversal paths. It limits metadata to 10 MiB, nesting to 64 levels, and parser work to 200,000 nodes. It supports single- and multi-file v1 metadata and the v1 portion of hybrid torrents. V2-only torrents/magnets are rejected with an explanation.

The creator accepts 1–1,000 files and at most 1 GiB total content. It hashes sliced input incrementally, including pieces spanning file boundaries and the final partial piece. It supports cancellation and progress. The library accepts power-of-two piece sizes from 16 KiB to 16 MiB; the UI offers a smaller practical selection. Private metadata requires a tracker. Creating a `.torrent` does not publish or seed the selected files.

Magnets accept 40-digit hexadecimal or 32-character Base32 v1 hashes and reject conflicting identifiers. Tracker metadata accepts valid HTTP(S), UDP, and WS(S) URLs (up to 50); credentials are rejected. Browser discovery restricts additional trackers to WSS. All displayed metadata is ordinary React text, not rendered HTML.

## Calculator formulas

Units are explicit: MB/GB/TB are decimal; MiB/GiB/TiB are binary. Network Mbps/Gbps are bits per second; MB/s and MiB/s are bytes per second.

```text
usable bytes/s = speed converted to bytes/s × efficiency / 100
remaining bytes = total bytes × (1 − completed percentage / 100)
remaining seconds = remaining bytes / usable bytes/s

video bytes = minutes × 60 × (video Mbps × 1,000,000 + audio Kbps × 1,000)
              / 8 × (1 + container overhead / 100)
savings % = (1 − video bytes / original bytes) × 100

working GB = original GB × (1 + additional extracted-data multiplier)
backup GB = working GB × number of backup copies
required GB = (working GB + backup GB) × (1 + headroom / 100)
monthly storage cost = required GB × user-entered monthly price per GB
```

Set the extracted-data multiplier to zero when retaining only the originals. Headroom is an additive margin, not a target free-disk percentage. Cloud prices are supplied by the user; bandwidth, request costs, taxes, and provider minimums are excluded.

ISP comparison uses medians of repeated measurements. VPN improvement is `(VPN median / direct median − 1) × 100`. Differences may also reflect routing, Wi-Fi, congestion, swarm variation, or VPN capacity. This is a measurement comparison, not an active speed test or definitive throttling detector.

Inputs reject nonfinite/invalid values and calculation overflow. Efficiency/completion/overhead/headroom cannot exceed their documented percentage bounds. Names remove path/illegal characters, normalize separators, validate optional years and episode numbers, and limit output length.

## Vendored engine and upgrading

The browser module is loaded only when a connected tool starts:

```text
Package: webtorrent@3.0.21 (official npm package)
Asset: public/vendor/webtorrent-3.0.21.min.js
License: public/vendor/WEBTORRENT-LICENSE.txt
Asset SHA-256: db4dca98cd135c732eeffdede3cf5f8febd0585a0eba4dc4d1effa1b901f4c3d
npm tarball SHA-1: 3fef10c0c80b73c8a7fca3dde3001a84ef23d8af
```

The official distribution ESM bundle was copied from the npm tarball. It is served locally, not imported from a third-party CDN at runtime. No WebTorrent native package installation is required. ESLint excludes the vendored bundle; do not hand-edit it.

For upgrades, inspect the official release/API changes, retrieve the pinned npm package, preserve license notices, replace the versioned bundle, update the loader and this provenance record, then test the sample, file selection across shared pieces, stop/navigation cleanup, private/large-torrent rejection, tracker failures, and a controlled WebRTC swarm. Verify the MIME type and production import URL. Review memory limits before increasing the maximum size.

## Protocol references

- [BEP 3: BitTorrent protocol specification](https://www.bittorrent.org/beps/bep_0003.html) — bencoding, metainfo, pieces, and v1 info hashes.
- [BEP 9: Metadata exchange](https://www.bittorrent.org/beps/bep_0009.html) — torrent metadata retrieval and magnet workflow.
- [WebTorrent API documentation](https://webtorrent.io/docs) — client, torrent, file, and browser APIs.
- [WebTorrent FAQ](https://webtorrent.io/faq) — browser/WebRTC compatibility and limitations.

See [verification](VERIFICATION.md) before treating an external swarm, new browser, or deployment environment as tested.

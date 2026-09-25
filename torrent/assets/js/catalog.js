/** Tool catalog: the single source for page generation, the directory, and tool dispatch. */
export const site = {
  name: "Torrent & Hashing Tools",
  parentName: "ToolsBase",
  parentUrl: "https://toolsbase.org/",
  // Public base URL, used for canonical links and the sitemap. Update it if the site moves.
  url: "https://devr77.github.io/alltools/torrent/",
  // Google Search Console "HTML tag" token: the content="…" value only. Empty = no tag.
  googleSiteVerification: "",
  // PostHog public project key (same project as toolsbase.org; phc_ keys are public by design). Empty = no analytics.
  posthog: { key: "phc_eXCuKwNYgQihmLDIdMR6cDiDlOj5goKTepN0O1pjN55", host: "https://us.i.posthog.com" },
  description: "Create magnet links, inspect torrent files, calculate info hashes, and build v1 torrents locally in your browser.",
};

// `kind` selects the UI module: metadata (local file/hash tools), calculator, or browser (WebTorrent).
export const torrentTools = [
  {
    slug: "magnet-link-generator",
    kind: "metadata",
    name: "Magnet Link Generator",
    icon: "🧲",
    description: "Build a magnet link from an info hash, name, and optional trackers.",
    help: "Paste a BitTorrent v1 info hash in hexadecimal or Base32. Add a display name and tracker URLs if you have them, then generate and copy your magnet link.",
  },
  {
    slug: "btih-hash-generator",
    kind: "metadata",
    name: "BTIH Hash Generator",
    icon: "🔢",
    description: "Calculate the BitTorrent v1 info hash of a .torrent file.",
    help: "Choose a .torrent file to calculate the SHA-1 hash of its original info dictionary. This is the torrent’s identifier, not the checksum of the complete .torrent file or its downloaded content.",
  },
  {
    slug: "torrent-file-parser",
    kind: "metadata",
    name: "Torrent File Parser",
    icon: "📂",
    description: "Inspect torrent metadata, file lists, sizes, and trackers.",
    help: "Choose a .torrent file to inspect its name, file list, piece details, trackers, and info hash. You can download the parsed metadata as JSON. This reads metadata; it does not download or verify the listed content.",
  },
  {
    slug: "torrent-file-creator",
    kind: "metadata",
    name: "Torrent File Creator",
    icon: "🛠️",
    description: "Create a downloadable v1 torrent from your local files.",
    help: "Select one or more files, choose a piece size, and optionally add trackers. Download the .torrent and open it in a BitTorrent client with the original files to start seeding. Creating metadata here does not publish or seed your files.",
  },
  {
    slug: "info-hash-extractor",
    kind: "metadata",
    name: "Info Hash Extractor",
    icon: "🔍",
    description: "Extract hexadecimal and Base32 hashes from magnets or torrents.",
    help: "Paste a magnet link or choose a .torrent file. Extract its BitTorrent v1 info hash in hexadecimal and Base32 formats. V2-only (btmh) links and torrents are not supported.",
  },
  {
    slug: "torrent-health-checker",
    kind: "browser",
    name: "Torrent Health Checker",
    icon: "📶",
    description: "Check live browser-compatible peer connectivity without downloading payloads.",
    help: "Connect to the trackers in your magnet or torrent and observe WebRTC peers for 30 seconds. No peers found is inconclusive: ordinary TCP-only peers are invisible to a browser.",
  },
  {
    slug: "torrent-to-direct-download",
    kind: "browser",
    keywords: "torrent file to mp4, torrent file to pdf, torrent file to direct download, torrent file to normal file online",
    name: "Torrent to Direct Download",
    icon: "📥",
    description: "Retrieve actual files from compatible torrents and save them in your browser.",
    help: "A torrent is metadata, not an MP4 or PDF. Connect to compatible peers, download the actual content, then save the completed file. This does not create a permanent hosted HTTP link or transcode content.",
  },
  {
    slug: "isp-throttling-detector",
    kind: "calculator",
    name: "ISP Throttling Comparison",
    icon: "🔎",
    description: "Compare direct and VPN measurements for possible traffic shaping.",
    help: "Enter repeated direct, VPN, and reference speeds measured under similar conditions. Differences can suggest further testing but cannot prove ISP throttling; swarm, routing, Wi-Fi, and VPN limits also affect speed.",
  },
  {
    slug: "torrent-naming-standard-generator",
    kind: "calculator",
    name: "Torrent Naming Standard Generator",
    icon: "🏷️",
    description: "Build consistent names for movies, TV episodes, and general files.",
    help: "Combine a title with optional release details. Output is a naming convention only; it does not verify the source, quality, codec, or ownership of your content.",
  },
  {
    slug: "browser-torrent-downloader",
    kind: "browser",
    name: "Browser Torrent Downloader",
    icon: "🌐",
    description: "Download files from WebRTC-compatible torrent peers directly in your browser.",
    help: "Paste a magnet link or choose a torrent. Start a peer connection, then select files to download and save. Keep this tab open. Peers and trackers can see your IP address and torrent identifier.",
  },
  {
    slug: "torrent-file-to-magnet",
    kind: "metadata",
    keywords: "torrent file to magnet, torrent file to link, torrent file to magnet link",
    name: "Torrent File to Magnet Link",
    icon: "🔗",
    description: "Convert a .torrent file into a shareable magnet link locally.",
    help: "Choose a torrent file to calculate its info hash and build a magnet link with its display name and trackers. No content download is required.",
  },
];

export function findTool(slug) {
  return torrentTools.find((tool) => tool.slug === slug);
}

/** Tool pages live one folder deep (/<slug>/), so sibling links go up one level. */
export function toolHref(slug) {
  return `../${slug}/`;
}

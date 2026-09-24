export const torrentTools = [
  {
    slug: "magnet-link-generator",
    name: "Magnet Link Generator",
    icon: "🧲",
    description: "Build a magnet link from an info hash, name, and optional trackers.",
    help: "Paste a BitTorrent v1 info hash in hexadecimal or Base32. Add a display name and tracker URLs if you have them, then generate and copy your magnet link.",
  },
  {
    slug: "btih-hash-generator",
    name: "BTIH Hash Generator",
    icon: "🔢",
    description: "Calculate the BitTorrent v1 info hash of a .torrent file.",
    help: "Choose a .torrent file to calculate the SHA-1 hash of its original info dictionary. This is the torrent’s identifier, not the checksum of the complete .torrent file or its downloaded content.",
  },
  {
    slug: "torrent-file-parser",
    name: "Torrent File Parser",
    icon: "📂",
    description: "Inspect torrent metadata, file lists, sizes, and trackers.",
    help: "Choose a .torrent file to inspect its name, file list, piece details, trackers, and info hash. You can download the parsed metadata as JSON. This reads metadata; it does not download or verify the listed content.",
  },
  {
    slug: "torrent-file-creator",
    name: "Torrent File Creator",
    icon: "🛠️",
    description: "Create a downloadable v1 torrent from your local files.",
    help: "Select one or more files, choose a piece size, and optionally add trackers. Download the .torrent and open it in a BitTorrent client with the original files to start seeding. Creating metadata here does not publish or seed your files.",
  },
  {
    slug: "info-hash-extractor",
    name: "Info Hash Extractor",
    icon: "🔍",
    description: "Extract hexadecimal and Base32 hashes from magnets or torrents.",
    help: "Paste a magnet link or choose a .torrent file. Extract its BitTorrent v1 info hash in hexadecimal and Base32 formats. V2-only (btmh) links and torrents are not supported.",
  },
  {"slug": "torrent-download-time-calculator", "name": "Torrent Download Time Calculator", "icon": "⏱️", "description": "Estimate download time from file size, connection speed, and efficiency.", "help": "Enter the total size and your connection speed. Adjust efficiency for protocol overhead and swarm conditions. This is an estimate, not a guarantee."},
  {"slug": "torrent-health-checker", "name": "Torrent Health Checker", "icon": "📶", "description": "Check live browser-compatible peer connectivity without downloading payloads.", "help": "Connect to the trackers in your magnet or torrent and observe WebRTC peers for 30 seconds. No peers found is inconclusive: ordinary TCP-only peers are invisible to a browser."},
  {"slug": "internet-to-torrent-speed-converter", "name": "Internet to Torrent Speed Converter", "icon": "⚡", "description": "Convert Mbps or Gbps into expected MB/s and MiB/s download speeds.", "help": "Internet plans use bits per second; torrent clients often show bytes per second. Eight bits equal one byte. Set an efficiency factor for an estimated usable rate."},
  {"slug": "video-file-size-reduction-estimator", "name": "Video File Size Reduction Estimator", "icon": "🎞️", "description": "Estimate video size and savings using duration and target bitrates.", "help": "Use your intended video and audio bitrates to estimate output size. Resolution or codec alone cannot guarantee a compression ratio. This tool estimates; it does not encode a video."},
  {"slug": "torrent-to-direct-download", "keywords": "torrent file to mp4 torrent file to mp4 converter torrent file to pdf torrent file to pdf converter online torrent file to direct download torrent file to normal file online torrent file to download", "name": "Torrent to Direct Download", "icon": "📥", "description": "Retrieve actual files from compatible torrents and save them in your browser.", "help": "A torrent is metadata, not an MP4 or PDF. Connect to compatible peers, download the actual content, then save the completed file. This does not create a permanent hosted HTTP link or transcode content."},
  {"slug": "storage-requirement-calculator", "name": "Storage Requirement Calculator", "icon": "💾", "description": "Plan download, extracted-file, backup, and cloud storage requirements.", "help": "Estimate space for originals, expanded archives, backup copies, and headroom. Enter your provider’s price for an optional monthly storage estimate; bandwidth and request charges are excluded."},
  {"slug": "isp-throttling-detector", "name": "ISP Throttling Comparison", "icon": "🔎", "description": "Compare direct and VPN measurements for possible traffic shaping.", "help": "Enter repeated direct, VPN, and reference speeds measured under similar conditions. Differences can suggest further testing but cannot prove ISP throttling; swarm, routing, Wi-Fi, and VPN limits also affect speed."},
  {"slug": "torrent-naming-standard-generator", "name": "Torrent Naming Standard Generator", "icon": "🏷️", "description": "Build consistent names for movies, TV episodes, and general files.", "help": "Combine a title with optional release details. Output is a naming convention only; it does not verify the source, quality, codec, or ownership of your content."},
  {"slug": "browser-torrent-downloader", "name": "Browser Torrent Downloader", "icon": "🌐", "description": "Download files from WebRTC-compatible torrent peers directly in your browser.", "help": "Paste a magnet link or choose a torrent. Start a peer connection, then select files to download and save. Keep this tab open. Peers and trackers can see your IP address and torrent identifier."},
  {"slug": "torrent-file-to-magnet", "keywords": "torrent file to magnet torrent file to link torrent file to magnet link", "name": "Torrent File to Magnet Link", "icon": "🔗", "description": "Convert a .torrent file into a shareable magnet link locally.", "help": "Choose a torrent file to calculate its info hash and build a magnet link with its display name and trackers. No content download is required."},
] as const;

export type TorrentToolSlug = (typeof torrentTools)[number]["slug"];

export const calculatorSlugs = ["torrent-download-time-calculator", "internet-to-torrent-speed-converter", "video-file-size-reduction-estimator", "storage-requirement-calculator", "isp-throttling-detector", "torrent-naming-standard-generator"];

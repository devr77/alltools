/**
 * Catalog: the single source for the HLS pages and their SEO copy.
 * Each tool becomes /hls/<slug> (or /<slug> on the HLS domain) with its own title, description, H1, intro, steps,
 * features, use cases, and FAQ. `mode` picks the interactive panel in sections.tsx.
 */
import { CANONICAL_URL } from "./domain";

export type HlsTool = {
  slug: string; name: string; icon: string; hue: string[]; mode: "download" | "player" | "checker" | "convert";
  /** H1 as [highlighted part, rest]. */
  h1: [string, string];
  title: string; description: string; lead: string; intro: string[];
  steps: string[][]; features: string[][]; useCases: string[][]; faqs: string[][];
};

export const site = {
  name: "HLS & M3U8 Tools",
  brand: "HLS Tools",
  // Canonical base for page URLs; per-host link prefixes live in place.ts.
  url: CANONICAL_URL,
  title: "HLS Tools – Download, Play, and Check M3U8 Streams Online",
  description: "Free browser tools for HLS streams: download M3U8 links as MP4, play and test streams, inspect playlists, and convert TS to MP4. Nothing to install, no sign-up.",
};

/* hue: [accent, soft highlight]. The accent must stay readable as text on the light background; dark mode uses the highlight. */
export const tools: HlsTool[] = [
  {
    slug: "hls-downloader",
    name: "HLS Downloader",
    icon: "download",
    hue: ["#4f46e5", "#a5b4fc"],
    mode: "download",
    h1: ["HLS", " Downloader"],
    title: "HLS Downloader – Download M3U8 Streams as MP4 Online",
    description: "Paste an M3U8 link to download an HLS stream as an MP4 or TS file. Pick the quality, decrypt AES-128, and save it, all in your browser. Free, no sign-up.",
    lead: "Paste an .m3u8 link, choose a quality, and save the stream as one MP4 file. Segments are downloaded and joined in your browser, without re-encoding.",
    intro: [
      "HLS (HTTP Live Streaming) doesn't deliver a video as one file. A playlist ending in .m3u8 lists hundreds of short segments, often in several qualities, and the player fetches them one by one. That's why most streams have no Save button.",
      "This downloader reads the playlist, fetches every segment of the quality you pick, decrypts AES-128 segments when the key is available, and joins them. MPEG-TS streams are rewrapped as MP4 (H.264 and AAC, with no quality loss) or kept as TS if you prefer. Fragmented MP4 streams are joined as they are. Everything runs in your browser, so the stream's server must allow cross-origin access (CORS).",
    ],
    steps: [
      ["Paste the M3U8 link", "Copy the playlist address from the video page or your browser's Network tab, paste it in, and click Load."],
      ["Pick quality and format", "Choose a resolution if several are listed, then MP4 for compatibility or TS for the original format."],
      ["Download and save", "Segments download in parallel and join into one file, which saves to your device."],
    ],
    features: [
      ["Pick the quality", "Master playlists list every resolution and bitrate. Choose the one you want, or keep the best."],
      ["MP4 without re-encoding", "TS segments are rewrapped into MP4 in your browser, keeping the original picture and sound."],
      ["AES-128 decryption", "Streams encrypted with standard HLS AES-128 are decrypted automatically when the key is accessible."],
    ],
    useCases: [
      ["Your own streams", "Save a copy of a webinar, class, or broadcast you published over HLS."],
      ["Offline viewing", "Keep a lecture or public-domain film to watch without a connection, where its license allows."],
      ["Testing and QA", "Grab one rendition from your CDN to check encoding, sync, or a reported glitch frame by frame."],
      ["Archiving", "Keep a recording of an event you ran before its stream link expires."],
    ],
    faqs: [
      ["How do I download an M3U8 video?", "Paste the playlist address (it ends in .m3u8) and click Load. If several qualities are listed, pick one. Choose MP4 or TS, then click Download. When every segment has been fetched, the file saves to your device."],
      ["Where do I find the .m3u8 link?", "Open the page with the video, open your browser's developer tools (F12), go to the Network tab, type m3u8 in the filter box, and start the video. Right-click the playlist request and copy its URL. The master playlist, which lists several qualities, is the best one to copy."],
      ["Why does it say the server doesn't allow other websites to load it?", "Browsers only let a page read a stream from another site if that site sends CORS headers allowing it. Many streams do, because their players run on other domains, but some are locked to their own site. Those can't be downloaded from a web page; a desktop tool such as ffmpeg can read them instead."],
      ["Can it download DRM-protected streams?", "No. Streams protected with Widevine, FairPlay, PlayReady, or SAMPLE-AES are refused. Only unencrypted streams and standard AES-128 encryption with an accessible key are supported."],
      ["Should I choose MP4 or TS?", "MP4 plays almost everywhere, including phones, browsers, and video editors, so it's the default. TS is the stream's original format. Choose it if MP4 conversion fails, if the stream uses codecs other than H.264 and AAC (such as H.265 or Dolby audio), or if the MP4 stutters at ad breaks."],
      ["Is there a size or length limit?", "There's no fixed limit, but the file is assembled in your browser before it's saved. Desktop Chrome and Edge handle several gigabytes; Safari and phones have less room. For very long streams, pick a lower quality."],
      ["Can I download live streams?", "Partly. A live playlist lists only the last few segments, so you get the stretch that's available when you click Download. To save a whole event, use its recording (VOD) playlist once the event ends."],
      ["Is my stream sent to your servers?", "No. Your browser fetches the segments directly from the stream's server and builds the file on your device. Nothing passes through ToolsBase."],
      ["Is it legal to download HLS streams?", "Download only content you own, content licensed for download, or public-domain material. Many sites' terms forbid saving their streams, and you're responsible for following them and copyright law."],
    ],
  },
  {
    slug: "m3u8-player",
    name: "M3U8 Player",
    icon: "play",
    hue: ["#be185d", "#f9a8d4"],
    mode: "player",
    h1: ["M3U8", " Player"],
    title: "M3U8 Player – Play HLS Streams Online in Your Browser",
    description: "Play any M3U8 link online. Test HLS streams in your browser, switch quality, and see the live resolution and bitrate. Free, with no plugins or sign-up.",
    lead: "Paste an .m3u8 link and it plays right here, in any modern browser. Switch quality, check that a stream works, and see what the player is loading.",
    intro: [
      "Most browsers can't open an .m3u8 link on their own. Chrome and Firefox download the playlist or show an error, because HLS needs a player that reads the playlist and feeds the segments to the video element. This page is that player.",
      "Playback uses hls.js, the open-source HLS player behind many video sites, with Safari's built-in HLS support as a fallback. It shows the current resolution and bitrate, lets you lock a quality, and explains errors in plain language, so it doubles as a quick stream tester.",
    ],
    steps: [
      ["Paste the M3U8 link", "Copy the playlist address and paste it into the box above the player."],
      ["Press Play", "The player loads the playlist and starts with a quality that suits your connection."],
      ["Switch or inspect", "Lock a quality, watch the bitrate, or open the same stream in the checker or downloader."],
    ],
    features: [
      ["Quality switching", "Let the player adapt to your connection, or lock a resolution to check each rendition."],
      ["Live and on-demand", "Plays recorded videos and live streams, including streams with separate audio tracks."],
      ["Readable errors", "Network, CORS, expired-link, and codec problems are explained, not just reported as failed."],
    ],
    useCases: [
      ["Stream testing", "Confirm a new encoder or CDN setup plays before you ship it."],
      ["Checking a link", "See whether an .m3u8 link from a colleague, client, or API still works."],
      ["Watching in any browser", "Play HLS in Chrome, Firefox, or Edge, which don't open .m3u8 links on their own."],
      ["Debugging players", "Compare with your own player to tell stream problems from player bugs."],
    ],
    faqs: [
      ["How do I play an M3U8 link online?", "Paste the .m3u8 address into the box and click Play. The stream starts in the player below it. Use the quality menu to lock a resolution."],
      ["Why won't my M3U8 link play?", "The usual reasons are: the server doesn't allow other websites to load the stream (CORS), the link has expired (many carry a time-limited token), the stream is DRM-protected, or it's an http:// address, which browsers block on secure pages. The message under the player says which."],
      ["Can I play a local .m3u8 file?", "Not directly. A playlist refers to its segments by address, so the player needs the playlist's URL. Paste the original link instead."],
      ["Which browsers are supported?", "Current versions of Chrome, Edge, Firefox, Opera, and Safari, on desktop and Android. On iPhone, Safari plays HLS natively."],
      ["Does the player save the stream?", "No. It streams segments from the server for playback only. To save a copy, use the HLS Downloader."],
    ],
  },
  {
    slug: "m3u8-checker",
    name: "M3U8 Checker",
    icon: "list",
    hue: ["#0f766e", "#5eead4"],
    mode: "checker",
    h1: ["M3U8", " Checker"],
    title: "M3U8 Checker – Test and Inspect HLS Playlists Online",
    description: "Check an M3U8 link online: see whether the stream loads, list every quality, codec, and bitrate, count segments, and spot encryption and playlist errors. Free.",
    lead: "Paste an .m3u8 link to see what's inside: every rendition with its resolution, bitrate, and codecs, plus the duration, segments, encryption, and anything worth fixing.",
    intro: [
      "An HLS stream is described by plain-text playlists. A master playlist lists the available qualities plus audio and subtitle tracks; each media playlist lists segments with their durations, encryption keys, and boundaries. When a stream misbehaves, the answer is usually in those lines.",
      "The checker fetches the playlist from your browser, parses it, and lays it out as tables. For a master playlist, it can load every variant to compare durations and segment counts. It also flags common mistakes, such as segments longer than the target duration, missing tags, DRM, and servers that block cross-origin access.",
    ],
    steps: [
      ["Paste the M3U8 link", "Paste a master or media playlist address and click Check."],
      ["Read the report", "See the playlist type, renditions, duration, encryption, and any warnings."],
      ["Dig deeper", "Check every variant, read the raw playlist, or open the stream in the player."],
    ],
    features: [
      ["Every rendition at a glance", "Resolution, bitrate, frame rate, and codecs in plain words, such as H.264, AAC, or H.265."],
      ["Segment details", "Count, duration, container, byte ranges, discontinuities, and encryption for each media playlist."],
      ["Problem flags", "Spots out-of-spec durations, missing tags, DRM, and CORS blocks, and says what each means."],
    ],
    useCases: [
      ["Encoder setup", "Check that each rendition has the resolution and bitrate you configured."],
      ["CDN troubleshooting", "Find out whether a failing stream is blocked, expired, or malformed."],
      ["Before downloading", "See the available qualities and total length before you save a stream."],
      ["Learning HLS", "See how real playlists are put together, with the raw text alongside."],
    ],
    faqs: [
      ["How do I check whether an M3U8 link works?", "Paste it and click Check. If the playlist loads, you'll see its contents; for a master playlist, click Check all variants to load each one too. If it fails, the error says whether the server refused, blocked cross-origin access, or returned something other than a playlist."],
      ["What's the difference between a master and a media playlist?", "A master (multivariant) playlist lists several versions of the same stream at different resolutions and bitrates, plus alternative audio and subtitle tracks. A media playlist lists the segments of one version. Players pick a variant from the master, then follow its media playlist."],
      ["What does 'longer than the target duration' mean?", "#EXT-X-TARGETDURATION promises that no segment, rounded to the nearest second, is longer than this value. Players use it to plan buffering and live refreshes, so breaking it can cause stalls. Re-segment the stream or raise the target duration."],
      ["Why does a stream work elsewhere but fail here?", "The checker runs in your browser, so the server must allow other websites to read the stream (CORS). A player on the stream's own site doesn't need that permission. A CORS error here means the stream is locked to its own domain."],
      ["Does the checker download the video?", "No. It reads only the text playlists, which are a few kilobytes each. Segments aren't fetched."],
    ],
  },
  {
    slug: "ts-to-mp4",
    name: "TS to MP4",
    icon: "convert",
    hue: ["#c2410c", "#fdba74"],
    mode: "convert",
    h1: ["TS to MP4", " Converter"],
    title: "TS to MP4 Converter – Convert MPEG-TS Files Online, No Upload",
    description: "Convert .ts video files to MP4 in your browser. Join several TS segments into one MP4 without re-encoding or uploading anything. Free, private, no sign-up.",
    lead: "Turn .ts files into an MP4 that plays everywhere. Choose one file or a whole set of segments; they're joined in order and rewrapped on your device, without re-encoding.",
    intro: [
      "MPEG-TS (.ts) is the format broadcast TV and HLS streams use. Players such as VLC open it, but phones, editors, and many apps expect MP4. The video and audio inside are usually H.264 and AAC, which MP4 uses too, so the file only needs a new container.",
      "This converter does exactly that, in your browser with mux.js: it reads the TS packets and writes the same video and audio into an MP4 file. Nothing is re-encoded, so it's quick and keeps the original quality, and nothing is uploaded. Choose several segment files to join them into one video, in file-name order.",
    ],
    steps: [
      ["Choose TS files", "Drop one .ts file or a set of segments, or click to browse."],
      ["Check the order", "Segments are sorted by name, with numbers in natural order (2 before 10)."],
      ["Convert and save", "The MP4 is built on your device and saved with one click."],
    ],
    features: [
      ["No upload", "Files are converted on your device and never leave it, so it suits private recordings too."],
      ["Lossless and fast", "Video and audio are copied into MP4 as they are, without re-encoding."],
      ["Join segments", "Choose many .ts segments and get one MP4, sorted in natural file-name order."],
    ],
    useCases: [
      ["Saved streams", "Convert TS files saved from HLS streams into MP4."],
      ["TV and DVR recordings", "Make broadcast recordings play on phones and in editors."],
      ["Video editing", "Import into editors that don't accept MPEG-TS."],
      ["Sharing", "Send a clip as MP4 so it plays for everyone."],
    ],
    faqs: [
      ["How do I convert TS to MP4?", "Drop your .ts file, or several segment files, into the box. Check the order, then click Convert. When it finishes, save the MP4."],
      ["Does converting reduce quality?", "No. The video and audio are copied into the MP4 container unchanged; nothing is re-encoded."],
      ["Which TS files can it convert?", "Files with H.264 video and AAC audio, the most common combination for HLS and broadcast. H.265 (HEVC), MPEG-2 video, AC-3, and MP3 audio aren't supported by the in-browser converter; use a desktop tool such as ffmpeg or HandBrake for those."],
      ["Are my files uploaded?", "No. Conversion runs in your browser and the files stay on your device. Once the page has loaded, it even works offline."],
      ["How do I join TS segments in the right order?", "Choose all the segment files at once. They're sorted by name in natural number order, so segment2 comes before segment10. Check the list before converting and remove any file you don't want."],
      ["Is there a size limit?", "There's no fixed limit. Files are read one at a time and the MP4 is assembled in browser storage; desktop Chrome and Edge handle several gigabytes."],
    ],
  },
];

export const navSlugs = tools.map((tool) => tool.slug);

export function findTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

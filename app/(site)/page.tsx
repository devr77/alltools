import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tool Base | A collection of useful online tools",
  description:
    "ToolsBase is a fast, free online tools website offering useful utilities for developers, creators, and everyday tasks. Simple, clean, and clutter-free.",
  keywords: ["tools", "utilities", "online tools", "productivity"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

import Home, { type Suite } from "./Home";
import { site as shareSite, tools as shareTools } from "../share/catalog";
import { site as hlsSite, tools as hlsTools } from "../hls/catalog";

// Share and HLS keep their own catalogs and layouts. The home page lists them as extra categories, built here on the
// server so only names, icons, one-line descriptions, and links reach the browser (not the full page copy).
// Links use each section's canonical URL (its own domain when one is configured; see app/share/domain.ts, app/hls/domain.ts).
const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0];

const shareIcons: Record<string, string> = {
  image: "🖼️", video: "🎬", pdf: "📕", gif: "🎞️", audio: "🎵", doc: "📝", archive: "🗜️",
  screenshot: "🖥️", text: "📃", json: "🧾", binary: "🔢", qr: "🔳", file: "📁",
};
const hlsIcons: Record<string, string> = { download: "⬇️", play: "▶️", list: "🩺", convert: "🔄" };

const suites: Suite[] = [
  {
    name: "File Sharing",
    slug: "share",
    icon: "🔗",
    href: shareSite.url,
    description: "Upload a file or paste text and get a link that deletes itself after 24 hours or 7 days.",
    keywords: "upload share link url host temporary send file",
    featured: ["image-to-url", "video-to-url", "pdf-to-url", "text-to-url", "file-to-url"],
    tools: shareTools.map((tool) => ({
      name: tool.name, slug: tool.slug, icon: shareIcons[tool.icon] ?? "📁",
      description: firstSentence(tool.lead), href: `${shareSite.url}/${tool.slug}`,
    })),
  },
  {
    name: "Video & HLS",
    slug: "hls",
    icon: "📺",
    href: hlsSite.url,
    description: "Download M3U8 streams as MP4, play and check HLS links, and convert TS files, all in your browser.",
    keywords: "m3u8 hls video stream download mp4 ts player",
    featured: hlsTools.map((tool) => tool.slug),
    tools: hlsTools.map((tool) => ({
      name: tool.name, slug: tool.slug, icon: hlsIcons[tool.icon] ?? "📺",
      description: firstSentence(tool.lead), href: `${hlsSite.url}/${tool.slug}`,
    })),
  },
];

function page() {
  return (
    <>
      <Home suites={suites} />
    </>
  );
}

export default page;

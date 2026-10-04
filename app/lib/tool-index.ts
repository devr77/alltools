/**
 * Every tool on the site in one list: the main categories (app/Constants.ts) plus the Share and HLS sections, which
 * keep their own catalogs and layouts. Built on the server; the home page and the header search receive only names,
 * icons, one-line descriptions, and links, never the full Share/HLS page copy.
 * Share and HLS links use each section's canonical URL (its own domain when one is configured).
 */
import { categories } from "../Constants";
import { site as shareSite, tools as shareTools } from "../share/catalog";
import { site as hlsSite, tools as hlsTools } from "../hls/catalog";

/** A section of the site with its own layout (Share, HLS), listed next to the main categories. */
export type Suite = {
  name: string;
  slug: string;
  icon: string;
  href: string;
  description: string;
  /** Extra search terms applied to every tool in the suite. */
  keywords: string;
  /** Slugs of the tools linked from the suite's card on the home page, in order. */
  featured: string[];
  tools: { name: string; slug: string; icon: string; description: string; href: string }[];
};

/** One entry in the header search. */
export type SearchTool = { name: string; category: string; icon: string; description: string; keywords: string; href: string };

const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0];

const shareIcons: Record<string, string> = {
  image: "🖼️", video: "🎬", pdf: "📕", gif: "🎞️", audio: "🎵", doc: "📝", archive: "🗜️",
  screenshot: "🖥️", text: "📃", json: "🧾", binary: "🔢", qr: "🔳", file: "📁",
};
const hlsIcons: Record<string, string> = { download: "⬇️", play: "▶️", list: "🩺", convert: "🔄" };

export const suites: Suite[] = [
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

/** The header search index: main tools first, in catalog order, then Share and HLS. */
export function searchTools(): SearchTool[] {
  return [
    ...categories.flatMap((category) => category.tools.map((tool) => ({
      name: tool.name,
      category: category.name,
      icon: tool.icon,
      description: tool.description,
      keywords: "keywords" in tool ? String(tool.keywords) : "",
      href: `/${category.slug}/${tool.slug}`,
    }))),
    ...suites.flatMap((suite) => suite.tools.map((tool) => ({
      name: tool.name, category: suite.name, icon: tool.icon, description: tool.description, keywords: suite.keywords, href: tool.href,
    }))),
  ];
}

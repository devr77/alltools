import { categories } from "../Constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Torrent & Hashing Tools - Free Torrent Utilities | ToolsBase",
  description:
    "Explore our collection of torrent and hashing tools including magnet link generators, BTIH hash generators, torrent file parsers, and more. Free online utilities for torrent management.",
  keywords: [
    "torrent tools",
    "hashing tools",
    "magnet link generator",
    "btih hash generator",
    "torrent file parser",
    "free torrent utilities",
  ],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/torrent" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  // Get the Torrent & Hashing Tools category
  const torrentToolsCategory = categories.find((cat) => cat.slug === "torrent");

  // Get all tools from the category
  const allTools = torrentToolsCategory ? torrentToolsCategory.tools : [];

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6"> Torrent & Hashing Tools</h1>

      {allTools.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {allTools.map((tool) => (
            <a
              key={tool.slug}
              href={`/torrent/${tool.slug}`}
              className="border border-border bg-card p-4 rounded-md hover:border-white transition"
            >
              <h3 className="font-medium flex items-center">
                <span className="mr-2">{tool.icon}</span>
                {tool.name}
              </h3>
              <p className="text-sm text-muted mt-1">Open tool →</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default page;

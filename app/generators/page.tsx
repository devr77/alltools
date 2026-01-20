import { categories } from "../Constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ID Generators - UUID & NanoID Tools | ToolsBase",
  description:
    "Generate unique identifiers with our UUID and NanoID generators. Free online tools for creating universally unique IDs for your applications.",
  keywords: ["uuid generator", "nanoid generator", "unique id", "identifier generator"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/generators" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  // Get the Trending Tools category
  const trendingToolsCategory = categories.find(
    (cat) => cat.slug === "generators",
  );

  // Get all tools from the category
  const allTools = trendingToolsCategory ? trendingToolsCategory.tools : [];

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Generators</h1>

      {allTools.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {allTools.map((tool) => (
            <a
              key={tool.slug}
              href={`/generators/${tool.slug}`}
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

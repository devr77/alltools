import { categories } from "../Constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Conversion & Formatting Tools | ToolsBase",
  description:
    "Convert and format data between various formats including JSON, XML, CSV, YAML, and more. Free online data conversion tools for developers.",
  keywords: ["data conversion", "json formatter", "xml tools", "csv converter", "data formatting"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  // Get the Trending Tools category
  const trendingToolsCategory = categories.find(
    (cat) => cat.slug === "data-convertor",
  );

  // Get all tools from the category
  const allTools = trendingToolsCategory ? trendingToolsCategory.tools : [];

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Data Conversion & Formatting</h1>

      {allTools.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {allTools.map((tool) => (
            <a
              key={tool.slug}
              href={`/data-convertor/${tool.slug}`}
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

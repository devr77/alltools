import type { ReactNode } from "react";
import { categories } from "../Constants";

export default function Layout({ children }: { children: ReactNode }) {
  // Get Trending Tools category
  const trendingToolsCategory = categories.find(
    (cat) => cat.slug === "trending-tools",
  );
  // Pick 3 random tools
  const similarTools = trendingToolsCategory
    ? [...trendingToolsCategory.tools]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
    : [];

  return (
    <div>
      <nav className="mb-6">
        {/* Example navigation links */}
        <a href="/" className="text-blue-600 hover:underline mr-4">
          Home
        </a>{" "}
        /{" "}
        <a href="/trending-tools" className="text-blue-600 hover:underline">
          Trending Tools
        </a>
      </nav>
      {children}
      {/* Similar Tools Section */}
      {similarTools.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Similar Tools</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {similarTools.map((tool) => (
              <a
                key={tool.slug}
                href={`/random-tools/${tool.slug}`}
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
        </div>
      )}
    </div>
  );
}

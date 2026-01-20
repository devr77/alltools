import React from "react";
import { categories } from "../Constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Randomisers - Random Data Generators | ToolsBase",
  description:
    "Generate random data for various needs including random animals and facts. Free online randomizer tools for developers and creators.",
  keywords: ["random generators", "random data", "randomizers", "random animals"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/randomisers" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  // Get the Randomisers category
  const randomisersCategory = categories.find(
    (cat) => cat.slug === "randomisers",
  );

  // Get all tools from the category
  const allTools = randomisersCategory ? randomisersCategory.tools : [];

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Randomisers</h1>

      {allTools.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {allTools.map((tool) => (
            <a
              key={tool.slug}
              href={`/randomisers/${tool.slug}`}
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

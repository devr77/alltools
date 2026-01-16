"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { usePostHog } from "posthog-js/react";
import { categories } from "./Constants";

export default function Home() {
  const posthog = usePostHog();
  const [searchTerm, setSearchTerm] = useState("");

  // Flatten all tools for search
  const allTools = useMemo(() => {
    return categories.flatMap((category) =>
      category.tools.map((tool) => ({
        ...tool,
        category: category.name,
        categoryIcon: category.icon,
      }))
    );
  }, []);

  // Initialize Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(allTools, {
      keys: ["name", "category"],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
    });
  }, [allTools]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }

    const results = fuse.search(searchTerm);
    return results.map((result) => result.item);
  }, [searchTerm, fuse]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Capture search term in PostHog
    if (value.trim()) {
      posthog.capture("tool_search", {
        search_term: value,
        search_length: value.length,
        has_results: searchResults.length > 0,
      });
    }
  };

  return (
    <>
      <div className="bg-zinc-50 font-sans dark:bg-black">
        <section className="mb-12">
          <h1 className="text-4xl font-semibold mb-3">
            Simple tools. Zero clutter.
          </h1>
          <p className="text-muted mb-6">
            Fast, free online utilities for developers & creators.
          </p>

          <input
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search a tool..."
            className="w-full bg-card border border-border px-4 py-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </section>

        {/* Search Results */}
        {searchTerm.trim() && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              Search Results{" "}
              {searchResults.length > 0 && `(${searchResults.length})`}
            </h2>

            {searchResults.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {searchResults.map((tool) => (
                  <a
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="border border-border bg-card p-4 rounded-md hover:border-white transition"
                  >
                    <div className="flex items-center mb-2">
                      <span className="mr-2 text-sm text-muted">
                        {tool.categoryIcon} {tool.category}
                      </span>
                    </div>
                    <h3 className="font-medium flex items-center">
                      <span className="mr-2">{tool.icon}</span>
                      {tool.name}
                    </h3>
                    <p className="text-sm text-muted mt-1">Open tool →</p>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted">
                  No tools found matching "{searchTerm}"
                </p>
                <p className="text-sm text-muted mt-2">
                  Try a different search term
                </p>
              </div>
            )}
          </section>
        )}

        {/* All Categories */}
        {(!searchTerm.trim() || searchResults.length === 0) && (
          <section className="space-y-10">
            {categories.map((category) => (
              <div key={category.name}>
                <div className="flex items-center mb-3">
                  <span className="mr-2 text-xl">{category.icon}</span>
                  <h2 className="text-2xl font-semibold">{category.name}</h2>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {category.tools.map((tool) => (
                    <a
                      key={tool.slug}
                      href={`/${category.slug}/${tool.slug}`}
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
            ))}
          </section>
        )}
      </div>
    </>
  );
}

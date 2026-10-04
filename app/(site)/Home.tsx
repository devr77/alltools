"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { usePostHog } from "posthog-js/react";
import { categories } from "@/app/Constants";
import styles from "./Home.module.css";

type Tool = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  keywords: string;
  href: string;
  category: string;
  categorySlug: string;
};
type DirectoryCategory = { name: string; slug: string; icon: string; href: string; tools: Tool[] };

/** A section of the site with its own layout (Share, HLS), listed on the home page next to the main categories. */
export type Suite = {
  name: string;
  slug: string;
  icon: string;
  href: string;
  description: string;
  /** Extra search terms applied to every tool in the suite. */
  keywords: string;
  /** Slugs of the tools linked from the suite's card, in order. */
  featured: string[];
  tools: { name: string; slug: string; icon: string; description: string; href: string }[];
};

const mainCategories: DirectoryCategory[] = categories.map((category) => ({
  name: category.name,
  slug: category.slug,
  icon: category.icon,
  href: `/${category.slug}`,
  tools: category.tools.map((tool) => ({
    ...tool,
    keywords: "keywords" in tool ? String(tool.keywords) : "",
    href: `/${category.slug}/${tool.slug}`,
    category: category.name,
    categorySlug: category.slug,
  })),
}));

const suiteCategory = (suite: Suite): DirectoryCategory => ({
  name: suite.name,
  slug: suite.slug,
  icon: suite.icon,
  href: suite.href,
  tools: suite.tools.map((tool) => ({
    ...tool,
    keywords: suite.keywords,
    category: suite.name,
    categorySlug: suite.slug,
  })),
});

const featuredSlugs = [
  "json-formatter-validator",
  "random-password-generator",
  "qr-code-generator",
];

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function ToolCard({
  tool,
  featured = false,
}: {
  tool: Tool;
  featured?: boolean;
}) {
  return (
    <a
      href={tool.href}
      className={`${styles.toolCard} ${featured ? styles.featuredCard : ""}`}
    >
      <div className={styles.cardTop}>
        <span className={styles.toolIcon} aria-hidden="true">
          {tool.icon}
        </span>
        {featured ? (
          <span className={styles.cardCategory}>{tool.category}</span>
        ) : (
          <Arrow className={styles.cardArrow} />
        )}
      </div>
      <h3>{tool.name}</h3>
      <p>
        {tool.description ||
          `Explore ${tool.name.toLowerCase()} for your next task.`}
      </p>
      {featured && (
        <span className={styles.openTool}>
          Open tool <Arrow />
        </span>
      )}
    </a>
  );
}

export default function Home({ suites = [] }: { suites?: Suite[] }) {
  const posthog = usePostHog();
  const directory = useMemo(() => [...mainCategories, ...suites.map(suiteCategory)], [suites]);
  const tools = useMemo(() => directory.flatMap((category) => category.tools), [directory]);
  const featuredTools = useMemo(
    () => featuredSlugs.flatMap((slug) => tools.filter((tool) => tool.slug === slug)),
    [tools],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const searchInput = useRef<HTMLInputElement>(null);
  const query = searchTerm.trim();

  const fuse = useMemo(
    () =>
      new Fuse(tools, {
        keys: ["name", "category", "keywords"],
        ignoreFieldNorm: true,
        threshold: 0.3,
      }),
    [tools],
  );

  const matchedTools = useMemo(() => {
    const results = query
      ? fuse.search(query).map((result) => result.item)
      : tools;
    return activeCategory === "all"
      ? results
      : results.filter((tool) => tool.categorySlug === activeCategory);
  }, [query, activeCategory, fuse, tools]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (!query) return;
    const timeout = window.setTimeout(() => {
      posthog.capture("tool_search", {
        search_term: query,
        search_length: query.length,
        has_results: matchedTools.length > 0,
        category: activeCategory,
      });
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [query, matchedTools.length, activeCategory, posthog]);

  const resetFilters = () => {
    setSearchTerm("");
    setActiveCategory("all");
    searchInput.current?.focus();
  };

  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>
            <span className={styles.statusDot} /> YOUR EVERYDAY TOOLKIT
          </span>
          <h1 id="home-title">
            Simple tools. <span>Zero clutter.</span>
          </h1>
          <p className={styles.heroDescription}>
            Free online tools for developers, creators, and everyday tasks.
          </p>
        </div>
        <div className={styles.heroSearch}>
          <div className={styles.searchBox} role="search">
            <SearchIcon />
            <label htmlFor="tool-search" className={styles.srOnly}>
              Search tools
            </label>
            <input
              ref={searchInput}
              id="tool-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setSearchTerm("");
              }}
              placeholder="What do you need to get done?"
              aria-controls="tool-directory"
              autoComplete="off"
            />
            <kbd aria-hidden="true">⌘ / Ctrl K</kbd>
          </div>
          <div className={styles.suggestions}>
            <span>Try searching</span>
            {["JSON", "Password", "QR code"].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchTerm(term);
                  setActiveCategory("all");
                  searchInput.current?.focus();
                }}
              >
                {term}
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {!query && activeCategory === "all" && (
        <section className={styles.featured} aria-labelledby="featured-title">
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="featured-title">Everyday essentials</h2>
            </div>
            <a href="#tool-directory" className={styles.textLink}>
              Explore all tools <Arrow />
            </a>
          </div>
          <div className={styles.featuredGrid}>
            {featuredTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} featured />
            ))}
          </div>
        </section>
      )}

      <section
        className={styles.directory}
        id="tool-directory"
        aria-labelledby="directory-title"
      >
        <div className={styles.directoryHeading}>
          <div>
            <h2 id="directory-title">The tool collection</h2>
          </div>
          <span className={styles.resultCount} role="status" aria-live="polite">
            {matchedTools.length} {matchedTools.length === 1 ? "tool" : "tools"}
            {query || activeCategory !== "all"
              ? " found"
              : " at your fingertips"}
          </span>
        </div>
        <div className={styles.directoryLayout}>
          <aside className={styles.sidebar}>
            <p className={styles.sidebarLabel}>CATEGORIES</p>
            <nav
              className={styles.categoryNav}
              aria-label="Filter tools by category"
            >
              <button
                aria-pressed={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
              >
                <span aria-hidden="true">▦</span>
                <span>All tools</span>
                <span className={styles.categoryCount}>{tools.length}</span>
              </button>
              {directory.map((category) => (
                <button
                  key={category.slug}
                  aria-pressed={activeCategory === category.slug}
                  onClick={() => setActiveCategory(category.slug)}
                >
                  <span aria-hidden="true">
                    {category.slug === "trending-tools" ? "🔥" : category.icon}
                  </span>
                  <span>{category.name}</span>
                  <span className={styles.categoryCount}>
                    {category.tools.length}
                  </span>
                </button>
              ))}
            </nav>
            <div className={styles.sidebarNote}>
              <span aria-hidden="true">↗</span>
              <strong>Small tools. Big possibilities.</strong>
              <p>Pick a tool, get it done, and get back to what matters.</p>
            </div>
          </aside>
          <div className={styles.toolGroups}>
            {(query || activeCategory !== "all") && (
              <div className={styles.filterSummary}>
                <span>
                  {query ? (
                    <>
                      Results for <strong>“{query}”</strong>
                    </>
                  ) : (
                    directory.find(
                      (category) => category.slug === activeCategory,
                    )?.name
                  )}
                </span>
                <button onClick={resetFilters}>
                  Clear filters <span aria-hidden="true">×</span>
                </button>
              </div>
            )}
            {matchedTools.length === 0 ? (
              <div className={styles.emptyState}>
                <SearchIcon />
                <h3>No tools found</h3>
                <p>Try a different keyword or browse all categories.</p>
                <button onClick={resetFilters}>
                  Browse all tools <Arrow />
                </button>
              </div>
            ) : query ? (
              <div className={styles.toolGrid}>
                {matchedTools.map((tool) => (
                  <ToolCard
                    key={`${tool.categorySlug}/${tool.slug}`}
                    tool={tool}
                  />
                ))}
              </div>
            ) : (
              directory
                .filter(
                  (category) =>
                    activeCategory === "all" ||
                    category.slug === activeCategory,
                )
                .map((category) => (
                  <section
                    key={category.slug}
                    className={styles.toolGroup}
                    aria-labelledby={`heading-${category.slug}`}
                  >
                    <div className={styles.groupHeading}>
                      <h3 id={`heading-${category.slug}`}>
                        {category.name}
                        <span>{category.tools.length}</span>
                      </h3>
                      <a
                        href={category.href}
                        aria-label={`View all ${category.name} tools`}
                      >
                        View all <Arrow />
                      </a>
                    </div>
                    <div className={styles.toolGrid}>
                      {matchedTools
                        .filter((tool) => tool.categorySlug === category.slug)
                        .map((tool) => (
                          <ToolCard key={tool.slug} tool={tool} />
                        ))}
                    </div>
                  </section>
                ))
            )}
          </div>
        </div>
      </section>

      {!query && activeCategory === "all" && suites.length > 0 && (
        <section className={styles.suites} aria-labelledby="suites-title">
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="suites-title">More toolkits</h2>
            </div>
          </div>
          <div className={styles.suiteGrid}>
            {suites.map((suite) => (
              <article key={suite.slug} className={styles.suiteCard}>
                <div className={styles.suiteTop}>
                  <span className={styles.suiteIcon} aria-hidden="true">
                    {suite.icon}
                  </span>
                  <h3>{suite.name}</h3>
                  <span className={styles.cardCategory}>
                    {suite.tools.length} tools
                  </span>
                </div>
                <p>{suite.description}</p>
                <ul className={styles.suiteLinks} aria-label={`${suite.name} tools`}>
                  {suite.featured
                    .flatMap((slug) => suite.tools.filter((tool) => tool.slug === slug))
                    .map((tool) => (
                      <li key={tool.slug}>
                        <a href={tool.href}>
                          <span aria-hidden="true">{tool.icon}</span>
                          {tool.name}
                        </a>
                      </li>
                    ))}
                </ul>
                <a
                  href={suite.href}
                  className={styles.openTool}
                  aria-label={`See all ${suite.tools.length} ${suite.name} tools`}
                >
                  See all {suite.tools.length} tools <Arrow />
                </a>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

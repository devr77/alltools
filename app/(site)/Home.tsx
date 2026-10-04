"use client";

import { useMemo, useState } from "react";
import { categories } from "@/app/Constants";
import type { Suite } from "@/app/lib/tool-index";
import styles from "./Home.module.css";

type Tool = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  href: string;
  category: string;
  categorySlug: string;
};
type DirectoryCategory = { name: string; slug: string; icon: string; href: string; tools: Tool[] };

const mainCategories: DirectoryCategory[] = categories.map((category) => ({
  name: category.name,
  slug: category.slug,
  icon: category.icon,
  href: `/${category.slug}`,
  tools: category.tools.map((tool) => ({
    ...tool,
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
  tools: suite.tools.map((tool) => ({ ...tool, category: suite.name, categorySlug: suite.slug })),
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

// Search lives in the site header (SiteSearch); the home page filters by category.
export default function Home({ suites = [] }: { suites?: Suite[] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const directory = useMemo(() => [...mainCategories, ...suites.map(suiteCategory)], [suites]);
  const tools = useMemo(() => directory.flatMap((category) => category.tools), [directory]);
  const featuredTools = useMemo(
    () => featuredSlugs.flatMap((slug) => tools.filter((tool) => tool.slug === slug)),
    [tools],
  );
  const shown = activeCategory === "all" ? directory : directory.filter((category) => category.slug === activeCategory);
  const shownCount = shown.reduce((sum, category) => sum + category.tools.length, 0);

  return (
    <div className={styles.home}>
      <h1 className={styles.srOnly}>
        ToolsBase: free online tools for developers, creators, and everyday tasks
      </h1>

      {activeCategory === "all" && (
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
            {shownCount} {shownCount === 1 ? "tool" : "tools"}
            {activeCategory !== "all" ? " in this category" : " at your fingertips"}
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
            {activeCategory !== "all" && (
              <div className={styles.filterSummary}>
                <span>{shown[0]?.name}</span>
                <button onClick={() => setActiveCategory("all")}>
                  Show all tools <span aria-hidden="true">×</span>
                </button>
              </div>
            )}
            {shown.map((category) => (
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
                  {category.tools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      {activeCategory === "all" && suites.length > 0 && (
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

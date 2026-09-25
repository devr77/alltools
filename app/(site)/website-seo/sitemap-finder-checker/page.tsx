import React from "react";
import SitemapFindChecker from "./SitemapFindChecker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitemap Finder and Checker - Find Sitemaps | ToolsBase",
  description:
    "Find any website's XML sitemap and check that it is reachable and valid. Free online sitemap finder and checker for SEO audits.",
  keywords: ["sitemap finder", "sitemap checker", "find xml sitemap", "sitemap test"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/website-seo/sitemap-finder-checker" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <SitemapFindChecker />
    </div>
  );
}

export default page;

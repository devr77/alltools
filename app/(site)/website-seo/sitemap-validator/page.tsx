import React from "react";
import SitemapValidator from "./SitemapValidator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitemap Validator - Validate Website Sitemaps | ToolsBase",
  description:
    "Validate XML sitemaps for syntax errors and compliance. Check your sitemap files before submitting to search engines. Free online sitemap validator.",
  keywords: ["sitemap validator", "xml validation", "seo validation", "sitemap checker"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/website-seo/sitemap-validator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <SitemapValidator />
    </div>
  );
}

export default page;

import React from "react";
import SitemapGen from "./SitemapGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitemap Generator - Create Website Sitemaps | ToolsBase",
  description:
    "Generate XML and HTML sitemaps for your website to improve SEO and search engine crawling. Create sitemaps from URLs or website structure.",
  keywords: ["sitemap generator", "xml sitemap", "html sitemap", "seo sitemap", "website crawler"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/website-seo/sitemap-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <SitemapGen />
    </div>
  );
}

export default page;

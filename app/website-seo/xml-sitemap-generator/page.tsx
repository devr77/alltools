import React from "react";
import XmlSitemapGen from "./XmlSitemapGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XML Sitemap Generator - Create XML Sitemaps | ToolsBase",
  description:
    "Generate an XML sitemap for your website to help Google and Bing crawl every page. Free online XML sitemap generator for SEO.",
  keywords: ["xml sitemap generator", "sitemap.xml", "seo sitemap", "generate sitemap"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/website-seo/xml-sitemap-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <XmlSitemapGen />
    </div>
  );
}

export default page;

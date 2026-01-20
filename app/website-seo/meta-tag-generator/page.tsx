import React from "react";
import MetaTagGen from "./MetaTagGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meta Tag Generator - Generate SEO Meta Tags | ToolsBase",
  description:
    "Generate comprehensive meta tags for your website including Open Graph, Twitter Cards, and standard meta tags. Boost your SEO and social media presence.",
  keywords: ["meta tag generator", "seo meta tags", "open graph", "twitter cards", "html meta"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/website-seo/meta-tag-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <MetaTagGen />
    </div>
  );
}

export default page;

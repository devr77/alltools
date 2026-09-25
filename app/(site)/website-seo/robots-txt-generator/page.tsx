import React from "react";
import RobottxtGen from "./RobottxtGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Robots.txt Generator - Create Robots.txt Files | ToolsBase",
  description:
    "Generate robots.txt files to control search engine crawling on your website. Define which pages search engines can access and which to exclude.",
  keywords: ["robots.txt generator", "search engine crawling", "seo robots", "crawler directives"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/website-seo/robots-txt-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <RobottxtGen />
    </div>
  );
}

export default page;

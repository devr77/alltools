import React from "react";
import AiBlogTitleGen from "./AiBlogTitleGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Blog Title Generator - Catchy Blog Titles | ToolsBase",
  description:
    "Generate catchy and engaging blog titles using AI. Create compelling headlines that attract readers and improve SEO. Free online tool.",
  keywords: ["ai blog title generator", "blog titles", "headline generator", "seo titles"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/ai-generators/ai-blog-title-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <AiBlogTitleGen />
    </div>
  );
}

export default page;

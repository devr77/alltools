import React from "react";
import AiFaqGen from "./AiFaqGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI FAQ Generator - Create FAQ Sections with AI | ToolsBase",
  description:
    "Generate comprehensive FAQ sections using AI for your website or documentation. Create helpful frequently asked questions automatically. Free online tool.",
  keywords: ["ai faq generator", "faq creator", "frequently asked questions", "ai content"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/ai-generators/ai-faq-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <AiFaqGen />
    </div>
  );
}

export default page;

import React from "react";
import AiLetterGen from "./AiLetterGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Letter Generator - Create Letters with AI | ToolsBase",
  description:
    "Generate professional letters using AI for business, personal, or formal correspondence. Create well-written letters instantly. Free online tool.",
  keywords: ["ai letter generator", "business letters", "formal letters", "ai writing"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/ai-generators/ai-letter-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <AiLetterGen />
    </div>
  );
}

export default page;

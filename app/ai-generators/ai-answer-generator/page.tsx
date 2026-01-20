import React from "react";
import AiansGen from "./AiansGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Answer Generator - Generate Answers with AI | ToolsBase",
  description:
    "Generate detailed answers to questions using AI. Create comprehensive responses for any topic with our AI answer generator. Free online tool.",
  keywords: ["ai answer generator", "question answers", "ai responses", "content generation"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/ai-generators/ai-answer-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <AiansGen />
    </div>
  );
}

export default page;

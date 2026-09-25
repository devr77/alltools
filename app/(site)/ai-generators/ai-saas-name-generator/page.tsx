import React from "react";
import AiSaasNameGen from "./AiSaasNameGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI SaaS Name Generator - Generate Startup Names | ToolsBase",
  description:
    "Generate creative and memorable SaaS product names using AI. Find the perfect name for your software startup or application. Free online tool.",
  keywords: ["ai saas name generator", "startup names", "product names", "business names"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/ai-generators/ai-saas-name-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <AiSaasNameGen />
    </div>
  );
}

export default page;

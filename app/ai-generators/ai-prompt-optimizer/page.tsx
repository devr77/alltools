import React from "react";
import AiPromptOptimizer from "./AiPromptOptimizer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Prompt Optimizer - Improve Your AI Prompts | ToolsBase",
  description:
    "Optimize your AI prompts for better results with our AI prompt optimizer. Enhance prompts for maximum effectiveness with AI models. Free online tool.",
  keywords: ["ai prompt optimizer", "prompt optimization", "ai improvement", "prompt enhancement"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/ai-generators/ai-prompt-optimizer" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <AiPromptOptimizer />
    </div>
  );
}

export default page;

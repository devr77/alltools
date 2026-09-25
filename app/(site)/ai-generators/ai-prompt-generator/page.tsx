import React from "react";
import AiPromptGen from "./AiPromptGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Prompt Generator - Create Perfect AI Prompts | ToolsBase",
  description:
    "Create effective prompts for AI models with our AI prompt generator. Craft perfect prompts for ChatGPT, Claude, and other AI assistants. Free online tool.",
  keywords: ["ai prompt generator", "chatgpt prompts", "ai prompts", "prompt engineering"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/ai-generators/ai-prompt-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <AiPromptGen />
    </div>
  );
}

export default page;

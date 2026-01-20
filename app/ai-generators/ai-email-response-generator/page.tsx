import React from "react";
import AiEmailResGen from "./AiEmailResGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Email Response Generator - Smart Email Replies | ToolsBase",
  description:
    "Generate professional email responses using AI. Create appropriate replies for business and personal emails with AI assistance. Free online tool.",
  keywords: ["ai email generator", "email response", "professional emails", "ai communication"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/ai-generators/ai-email-response-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <AiEmailResGen />
    </div>
  );
}

export default page;

import AireplyGen from "./AireplyGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Reply Generator - Smart Email & Message Responses | ToolsBase",
  description:
    "Generate intelligent replies using AI for emails, messages, and conversations. Free AI-powered reply generator for professional and personal communication.",
  keywords: ["ai reply generator", "email response", "ai assistant", "smart replies"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/ai-generators/ai-reply-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function Page() {
  return <AireplyGen />;
}

import type { Metadata } from "next";
import CategoryDirectory from "../components/CategoryDirectory";

export const metadata: Metadata = {
  title: "AI Generators - Free AI-Powered Text Tools | ToolsBase",
  description:
    "Discover our collection of AI-powered generators including reply generators, prompt optimizers, FAQ generators, and more. Free online tools for developers and creators.",
  keywords: ["ai generators", "artificial intelligence", "ai tools", "text generators", "ai prompts"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/ai-generators" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function Page() {
  return <CategoryDirectory slug="ai-generators" />;
}

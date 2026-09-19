import React from "react";
import WebPagetoMarkdown from "./WebPagetoMarkdown";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webpage to Markdown Converter - URL to MD | ToolsBase",
  description:
    "Convert any webpage URL into clean Markdown for notes, docs, or LLM context. Free online webpage to Markdown converter.",
  keywords: ["webpage to markdown", "url to markdown", "web page to md", "html to markdown"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/webpage-to-markdown-converter" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function Page() {
  return (
    <div>
      <WebPagetoMarkdown />
    </div>
  );
}

export default Page;

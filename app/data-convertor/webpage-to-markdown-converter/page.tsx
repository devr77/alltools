import React from "react";
import WebPagetoMarkdown from "./WebPagetoMarkdown";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL to Markdown Converter - Webpage to MD | ToolsBase",
  description:
    "Convert any webpage URL into clean Markdown for notes, docs, or LLM context. Free online URL to Markdown converter.",
  keywords: ["url to markdown", "webpage to markdown", "link to markdown", "website to markdown", "web page to md", "html to markdown"],
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

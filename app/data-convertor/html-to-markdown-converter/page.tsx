import React from "react";
import HtmltoMarkdown from "./HtmltoMarkdown";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML to Markdown Converter - HTML to MD | ToolsBase",
  description:
    "Convert HTML markup into clean, readable Markdown online. Strip tags and keep headings, links, and lists intact. Free HTML to Markdown converter.",
  keywords: ["html to markdown", "html to md", "convert html", "markdown converter"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/html-to-markdown-converter" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <HtmltoMarkdown />
    </div>
  );
}

export default page;

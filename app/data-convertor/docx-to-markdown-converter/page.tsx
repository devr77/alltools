import React from "react";
import DocstoMarkdown from "./DocstoMarkdown";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DOCX to Markdown Converter - Word to MD | ToolsBase",
  description:
    "Convert Word DOCX documents to clean Markdown while keeping headings, lists, and formatting. Free online DOCX to Markdown converter.",
  keywords: ["docx to markdown", "word to markdown", "doc to md", "convert docx"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/docx-to-markdown-converter" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <DocstoMarkdown />
    </div>
  );
}

export default page;

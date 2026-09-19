import React from "react";
import JsontoMarkdown from "./JsontoMarkdown";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to Markdown Converter - JSON to MD | ToolsBase",
  description:
    "Convert JSON data into readable Markdown tables and lists online. Free JSON to Markdown converter for docs, READMEs, and reports.",
  keywords: ["json to markdown", "json to md", "markdown table from json", "convert json"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/json-to-markdown-converter" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <JsontoMarkdown />
    </div>
  );
}

export default page;

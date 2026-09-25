import React from "react";
import TexttoMarkdown from "./TexttoMarkdown";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text to Markdown Converter - Plain Text to MD | ToolsBase",
  description:
    "Turn plain text into formatted Markdown with headings, lists, and emphasis. Free online text to Markdown converter, no signup needed.",
  keywords: ["text to markdown", "plain text to md", "markdown formatter", "convert text"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/text-to-markdown-converter" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <TexttoMarkdown />
    </div>
  );
}

export default page;

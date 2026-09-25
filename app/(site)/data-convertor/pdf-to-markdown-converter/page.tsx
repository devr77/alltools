import React from "react";
import PdftoMarkdown from "./PdftoMarkdown";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Markdown Converter - PDF to MD | ToolsBase",
  description:
    "Extract text from PDF files and convert it to clean Markdown online. Free PDF to Markdown converter that runs right in your browser.",
  keywords: ["pdf to markdown", "pdf to md", "extract pdf text", "convert pdf"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/pdf-to-markdown-converter" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <PdftoMarkdown />
    </div>
  );
}

export default page;

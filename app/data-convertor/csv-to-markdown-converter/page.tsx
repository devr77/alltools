import React from "react";
import CsvtoMarkdown from "./CsvtoMarkdown";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV to Markdown Converter - CSV to MD Table | ToolsBase",
  description:
    "Convert CSV files and spreadsheet data into clean Markdown tables instantly. Free online CSV to Markdown converter with no signup required.",
  keywords: ["csv to markdown", "csv to md table", "markdown table generator", "convert csv"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/csv-to-markdown-converter" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <CsvtoMarkdown />
    </div>
  );
}

export default page;

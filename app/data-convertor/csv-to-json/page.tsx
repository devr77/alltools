import React from "react";
import CsvJson from "./CsvJson";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV to JSON Converter - Convert CSV Files to JSON | ToolsBase",
  description:
    "Convert CSV files to JSON format instantly. Transform comma-separated values to JSON objects with our free online converter. Supports custom delimiters.",
  keywords: ["csv to json", "csv converter", "data conversion", "json transformation"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/csv-to-json" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <CsvJson />
    </div>
  );
}

export default page;

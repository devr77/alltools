import React from "react";
import JsontoCsv from "./JsontoCsv";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to CSV Converter - Convert JSON to CSV Files | ToolsBase",
  description:
    "Convert JSON data to CSV format instantly. Transform JSON objects to comma-separated values with our free online converter. Perfect for data export.",
  keywords: ["json to csv", "json converter", "data export", "csv transformation"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/json-to-csv" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <JsontoCsv />
    </div>
  );
}

export default page;

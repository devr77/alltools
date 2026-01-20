import React from "react";
import JsonFormatter from "./JsonFormatter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator - Format & Validate JSON | ToolsBase",
  description:
    "Format and validate JSON data with our free online JSON formatter. Check JSON syntax, beautify JSON, and validate JSON structure. Essential developer tool.",
  keywords: ["json formatter", "json validator", "json beautifier", "json syntax checker"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/json-formatter-validator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <JsonFormatter />
    </div>
  );
}

export default page;

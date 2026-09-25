import React from "react";
import JsonPrettyPrint from "./JsonPrettyPrint";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Pretty Print - Format JSON for Readability | ToolsBase",
  description:
    "Pretty print JSON data with proper indentation and formatting for better readability. Format JSON files with syntax highlighting. Free online tool.",
  keywords: ["json pretty print", "json formatter", "json beautifier", "readable json"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/json-pretty-print" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <JsonPrettyPrint />
    </div>
  );
}

export default page;

import React from "react";
import JsonMinifer from "./JsonMinifer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Minifier - Compress JSON Data Online | ToolsBase",
  description:
    "Minify JSON data to reduce file size for production. Remove unnecessary whitespace and formatting from JSON files. Free online JSON minifier.",
  keywords: ["json minifier", "json compressor", "json optimization", "minify json"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/json-minifier" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <JsonMinifer />
    </div>
  );
}

export default page;

import React from "react";
import JsonMerge from "./JsonMerge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Merge Tool - Combine JSON Files Online | ToolsBase",
  description:
    "Merge multiple JSON objects or files into a single JSON document online. Handle nested keys and conflicts with this free JSON merge tool.",
  keywords: ["json merge", "combine json", "merge json files", "json merger"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/json-merge" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <JsonMerge />
    </div>
  );
}

export default page;

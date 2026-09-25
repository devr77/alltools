import React from "react";
import JsonDiff from "./JsonDiff";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Diff Viewer - Compare JSON Online | ToolsBase",
  description:
    "Compare two JSON files or objects and highlight added, removed, and changed values side by side. Free online JSON diff and comparison tool.",
  keywords: ["json diff", "compare json", "json comparison", "json difference"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/json-diff" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <JsonDiff />
    </div>
  );
}

export default page;

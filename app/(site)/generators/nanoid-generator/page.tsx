import React from "react";
import NanoIdGen from "./NanoIdGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NanoID Generator - Generate Compact Unique IDs | ToolsBase",
  description:
    "Generate NanoIDs - compact, URL-friendly unique identifiers. Create short, secure IDs for your applications. Free online NanoID generator.",
  keywords: ["nanoid generator", "compact ids", "unique identifiers", "url friendly ids"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/generators/nanoid-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <NanoIdGen />
    </div>
  );
}

export default page;

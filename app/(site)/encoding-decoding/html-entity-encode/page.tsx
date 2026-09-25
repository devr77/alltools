import React from "react";
import HtmlEntityEncode from "./HtmlEntityEncode";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML Entity Encoder - Encode HTML Entities | ToolsBase",
  description:
    "Encode special characters as safe HTML entities to prevent rendering and XSS issues. Free online HTML entity encoder for developers.",
  keywords: ["html entity encode", "html encoder", "escape html", "encode special characters"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/encoding-decoding/html-entity-encode" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <HtmlEntityEncode />
    </div>
  );
}

export default page;

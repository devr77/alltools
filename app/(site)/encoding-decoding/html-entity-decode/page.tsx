import React from "react";
import HtmlEntityDecode from "./HtmlEntityDecode";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML Entity Decoder - Decode HTML Entities | ToolsBase",
  description:
    "Decode HTML entities and numeric character references back into readable text. Free online HTML entity decoder for developers.",
  keywords: ["html entity decode", "html decoder", "decode html entities", "unescape html"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/encoding-decoding/html-entity-decode" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <HtmlEntityDecode />
    </div>
  );
}

export default page;

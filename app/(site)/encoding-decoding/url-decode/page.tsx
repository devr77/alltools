import React from "react";
import UrlDecode from "./UrlDecode";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Decoder - Decode Encoded URLs | ToolsBase",
  description:
    "Decode percent-encoded URLs back to their original format. Convert encoded URLs to readable text. Free online URL decoder.",
  keywords: ["url decoder", "url decoding", "percent decoding", "encoded urls"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/encoding-decoding/url-decode" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <UrlDecode />
    </div>
  );
}

export default page;

import React from "react";
import UrlEncode from "./UrlEncode";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Encoder - Encode URLs for Web Safety | ToolsBase",
  description:
    "Encode URLs and text for safe transmission over the internet. Convert special characters to percent-encoded format. Free online URL encoder.",
  keywords: ["url encoder", "url encoding", "percent encoding", "web safe urls"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/encoding-decoding/url-encode" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <UrlEncode />
    </div>
  );
}

export default page;

import React from "react";
import Base64Encode from "./Base64Encode";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Encoder - Encode Data to Base64 | ToolsBase",
  description:
    "Encode text and data to Base64 format instantly. Convert binary data to ASCII text representation. Free online Base64 encoder for developers.",
  keywords: ["base64 encoder", "base64 encoding", "data encoding", "ascii conversion"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/encoding-decoding/base64-encode" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <Base64Encode />
    </div>
  );
}

export default page;

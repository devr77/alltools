import React from "react";
import Base64decode from "./Base64decode";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Decoder - Decode Base64 to Original Data | ToolsBase",
  description:
    "Decode Base64 encoded data back to its original format. Convert Base64 strings to text, images, and binary data. Free online Base64 decoder.",
  keywords: ["base64 decoder", "base64 decoding", "data decoding", "ascii to binary"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/encoding-decoding/base64-decode" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <Base64decode />
    </div>
  );
}

export default page;

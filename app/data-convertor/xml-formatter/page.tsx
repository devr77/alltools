import React from "react";
import XmlFormatter from "./XmlFormatter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XML Formatter - Format & Beautify XML | ToolsBase",
  description:
    "Format and beautify XML data with proper indentation and structure. Make XML files readable and well-organized. Free online XML formatter.",
  keywords: ["xml formatter", "xml beautifier", "xml pretty print", "xml structure"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/xml-formatter" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <XmlFormatter />
    </div>
  );
}

export default page;

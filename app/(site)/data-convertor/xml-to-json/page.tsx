import React from "react";
import XmltoJson from "./XmltoJson";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XML to JSON Converter - Convert XML to JSON | ToolsBase",
  description:
    "Convert XML data to JSON format instantly. Transform XML structures to JSON objects with our free online converter. Perfect for API data conversion.",
  keywords: ["xml to json", "xml converter", "data transformation", "api conversion"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/xml-to-json" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <XmltoJson />
    </div>
  );
}

export default page;

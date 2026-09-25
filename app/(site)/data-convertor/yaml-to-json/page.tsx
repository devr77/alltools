import React from "react";
import YamltoJson from "./YamltoJson";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YAML to JSON Converter - Convert YAML to JSON | ToolsBase",
  description:
    "Convert YAML configuration and data files to valid JSON online. Free YAML to JSON converter with instant validation in your browser.",
  keywords: ["yaml to json", "convert yaml to json", "yaml parser", "json converter"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/yaml-to-json" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <YamltoJson />
    </div>
  );
}

export default page;

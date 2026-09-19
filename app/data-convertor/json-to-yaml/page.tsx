import React from "react";
import JsontoYaml from "./JsontoYaml";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to YAML Converter - Convert JSON to YAML | ToolsBase",
  description:
    "Convert JSON data to valid YAML online with correct indentation and nesting. Free JSON to YAML converter for configs and CI pipelines.",
  keywords: ["json to yaml", "convert json to yaml", "yaml converter", "json yaml"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/json-to-yaml" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <JsontoYaml />
    </div>
  );
}

export default page;

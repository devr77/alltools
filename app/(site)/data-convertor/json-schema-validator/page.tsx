import React from "react";
import JsonSchemaValidator from "./JsonSchemaValidator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Schema Validator - Validate JSON Against Schema | ToolsBase",
  description:
    "Validate JSON data against JSON Schema specifications. Ensure your JSON conforms to defined structures and constraints. Free online validation tool.",
  keywords: ["json schema validator", "json validation", "schema validation", "json standards"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor/json-schema-validator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <JsonSchemaValidator />
    </div>
  );
}

export default page;

import React from "react";
import OpenApi from "./OpenApi";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenAPI Stub Generator - Create API Specs | ToolsBase",
  description:
    "Generate an OpenAPI 3 specification stub for your REST API with paths, methods, and schemas. Free online OpenAPI stub generator.",
  keywords: ["openapi generator", "swagger stub", "api spec generator", "openapi 3"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/website-seo/openapi-stub-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <OpenApi />
    </div>
  );
}

export default page;

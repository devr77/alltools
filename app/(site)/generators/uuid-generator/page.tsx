import React from "react";
import UuidGen from "./UuidGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UUID Generator - Generate Unique Identifiers | ToolsBase",
  description:
    "Generate universally unique identifiers (UUIDs) instantly. Create RFC 4122 compliant UUIDs for your applications and databases. Free online UUID generator.",
  keywords: ["uuid generator", "unique identifier", "guid generator", "rfc 4122"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/generators/uuid-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <UuidGen />
    </div>
  );
}

export default page;

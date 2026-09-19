import React from "react";
import ReadmeGen from "./ReadmeGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "README Generator - Create README.md Files | ToolsBase",
  description:
    "Build a professional README.md for your project with badges, install steps, and usage sections. Free online README generator for GitHub.",
  keywords: ["readme generator", "readme.md generator", "github readme", "project documentation"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/website-seo/readme-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <ReadmeGen />
    </div>
  );
}

export default page;

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tool Base | A collection of useful online tools",
  description:
    "ToolsBase is a fast, free online tools website offering 500+ utilities for developers, creators, and everyday tasks. Simple, clean, and clutter-free.",
  keywords: ["tools", "utilities", "online tools", "productivity"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

import Home from "./Home";

function page() {
  return (
    <>
      <Home />
    </>
  );
}

export default page;

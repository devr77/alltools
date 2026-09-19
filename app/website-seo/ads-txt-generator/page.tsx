import React from "react";
import AdsTxtGen from "./AdsTxtGen";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ads.txt Generator - Create ads.txt File Online | ToolsBase",
  description:
    "Generate a valid ads.txt file for your site to authorize ad sellers and protect ad revenue. Free ads.txt generator for publishers.",
  keywords: ["ads.txt generator", "ads txt file", "adsense ads.txt", "publisher ads txt"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/website-seo/ads-txt-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <AdsTxtGen />
    </div>
  );
}

export default page;

import React from "react";
import MorseTranslator from "./MorseTranslator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Morse Code Translator - Text to Morse Code | ToolsBase",
  description:
    "Translate text to Morse code and decode Morse back to text instantly. Free online Morse code translator with full alphabet support.",
  keywords: ["morse code translator", "text to morse", "morse decoder", "morse code converter"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/encoding-decoding/morse-translate" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <MorseTranslator />
    </div>
  );
}

export default page;

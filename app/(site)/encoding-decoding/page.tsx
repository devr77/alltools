import type { Metadata } from "next";
import CategoryDirectory from "@/app/components/CategoryDirectory";

export const metadata: Metadata = {
  title: "Encoding & Decoding Tools | ToolsBase",
  description:
    "Encode and decode data in various formats including Base64, URL encoding, HTML entities, JWT tokens, and Morse code. Free online encoding tools.",
  keywords: ["encoding", "decoding", "base64", "url encoding", "jwt decoder", "morse code"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/encoding-decoding" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function Page() {
  return <CategoryDirectory slug="encoding-decoding" />;
}

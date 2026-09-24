import type { Metadata } from "next";
import CategoryDirectory from "../components/CategoryDirectory";

export const metadata: Metadata = {
  title: "ID Generators - UUID & NanoID Tools | ToolsBase",
  description:
    "Generate unique identifiers with our UUID and NanoID generators. Free online tools for creating universally unique IDs for your applications.",
  keywords: ["uuid generator", "nanoid generator", "unique id", "identifier generator"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/generators" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function Page() {
  return <CategoryDirectory slug="generators" />;
}

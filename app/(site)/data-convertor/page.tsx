import type { Metadata } from "next";
import CategoryDirectory from "@/app/components/CategoryDirectory";

export const metadata: Metadata = {
  title: "Data Conversion & Formatting Tools | ToolsBase",
  description:
    "Convert and format data between various formats including JSON, XML, CSV, YAML, and more. Free online data conversion tools for developers.",
  keywords: ["data conversion", "json formatter", "xml tools", "csv converter", "data formatting"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/data-convertor" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function Page() {
  return <CategoryDirectory slug="data-convertor" />;
}

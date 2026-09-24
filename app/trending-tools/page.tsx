import type { Metadata } from "next";
import CategoryDirectory from "../components/CategoryDirectory";

export const metadata: Metadata = {
  title: "Trending Tools - Popular Online Utilities | ToolsBase",
  description:
    "Discover the most popular online tools including QR code generators, password generators, random name generators, and more. Free trending utilities for everyone.",
  keywords: ["trending tools", "popular tools", "qr code", "password generator", "random names"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/trending-tools" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function Page() {
  return <CategoryDirectory slug="trending-tools" />;
}

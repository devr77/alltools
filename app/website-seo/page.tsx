import type { Metadata } from "next";
import CategoryDirectory from "../components/CategoryDirectory";

export const metadata: Metadata = {
  title: "Website SEO Tools - Optimize Your Site | ToolsBase",
  description:
    "Boost your website's SEO with our comprehensive tools including meta tag generators, sitemap creators, robots.txt generators, and more. Free SEO utilities.",
  keywords: ["seo tools", "website optimization", "meta tags", "sitemap generator", "robots.txt"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/website-seo" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function Page() {
  return <CategoryDirectory slug="website-seo" />;
}

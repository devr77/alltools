import type { Metadata } from "next";
import CategoryDirectory from "@/app/components/CategoryDirectory";

export const metadata: Metadata = {
  title: "Randomisers - Random Data Generators | ToolsBase",
  description:
    "Generate random data for various needs including coin flips, dice rolls, and random animals. Free online randomizer tools for developers and creators.",
  keywords: ["random generators", "random data", "randomizers", "random animals", "coin flip", "dice roller"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/randomisers" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function Page() {
  return <CategoryDirectory slug="randomisers" />;
}

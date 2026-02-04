import type { Metadata } from "next";
import UrltoMarkdown from "./UrltoMarkdown";

export const metadata: Metadata = {
  title: "URL to Markdown Converter Simple and Free Online Tool | ToolsBase",
  description:
    "Convert URLs to Markdown format easily with our free online tool. Quickly generate Markdown links for your documents and websites.",
  keywords: ["url to markdown converter", "markdown link generator"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/trending-tools/url-to-markdown-converter" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "URL to Markdown Converter",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  url: "https://toolsbase.org/tools/url-to-markdown-converter",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const jsonldFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the URL to Markdown Converter free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, the URL to Markdown Converter is completely free to use with no sign-up required.",
      },
    },
    {
      "@type": "Question",
      name: "How does the URL to Markdown Converter work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The converter takes a URL and transforms it into Markdown link format, making it easy to include links in your Markdown documents.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use the URL to Markdown Converter for commercial purposes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can use the generated Markdown links for both personal and commercial purposes without any restrictions.",
      },
    },
  ],
};

function page() {
  return (
    <div>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(jsonldFaq)}</script>
      <UrltoMarkdown />
    </div>
  );
}

export default page;

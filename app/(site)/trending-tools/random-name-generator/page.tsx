import type { Metadata } from "next";
import RandomNameGen from "./RandomNameGen";

export const metadata: Metadata = {
  title: "Random Name Generator Simple and Free Online Tool | ToolsBase",
  description:
    "Generate random names by combining adjectives and nouns. Perfect for character names, usernames, or any creative project.",
  keywords: [
    "random name generator",
    "name generator",
    "generate random names",
    "adjective noun names",
    "creative name tool",
    "free name generator",
  ],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/trending-tools/random-name-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Random Name Generator",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  url: "https://toolsbase.org/trending-tools/random-name-generator",
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
      name: "Is the Random Name Generator free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, the Random Name Generator is completely free to use with no sign-up required.",
      },
    },
    {
      "@type": "Question",
      name: "What types of names can I generate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can generate random names by combining a variety of adjectives and nouns, suitable for characters, usernames, and more.",
      },
    },
  ],
};

function page() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonldFaq).replace(/</g, "\\u003c"),
        }}
      />
      <RandomNameGen />
    </div>
  );
}

export default page;

import type { Metadata } from "next";
import LastNameGen from "./LastNameGen";

export const metadata: Metadata = {
  title: "Last Name Generator Simple and Free Online Tool | ToolsBase",
  description:
    "Generate random last names for characters, stories, or any creative project. Customize length and origin, then copy or download the list.",
  keywords: [
    "last name generator",
    "generate last names",
    "random last names",
    "surname generator",
    "online last name tool",
    "free last name generator",
    "custom last names",
  ],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/trending-tools/last-name-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Last Name Generator",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  url: "https://toolsbase.org/tools/last-name-generator",
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
      name: "Is the Last Name Generator free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, the Last Name Generator is completely free to use with no sign-up required.",
      },
    },
    {
      "@type": "Question",
      name: "Can I customize the last names generated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can customize the length and origin of the last names generated.",
      },
    },
    {
      "@type": "Question",
      name: "Do you store the generated last names or data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, we do not store any generated last names or user data. All generation is done client-side for privacy.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use the generated last names for commercial projects?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can use the generated last names for both personal and commercial projects without any restrictions.",
      },
    },
  ],
};

function page() {
  return (
    <div>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(jsonldFaq)}</script>
      <LastNameGen />
    </div>
  );
}

export default page;

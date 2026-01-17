import type { Metadata } from "next";
import LoremPicsumGen from "./LoremPicsumGen";

export const metadata: Metadata = {
  title: "Lorem Ipsum Generator Simple and Free Online Tool | AllTools",
  description:
    "Generate placeholder text with our Lorem Ipsum Generator. Customize the number of paragraphs and words per paragraph for your design and development needs.",
  keywords: [
    "lorem ipsum generator",
    "generate lorem ipsum",
    "placeholder text generator",
    "dummy text generator",
    "free lorem ipsum",
    "custom lorem ipsum",
  ],
  publisher: "AllTools Network",
  metadataBase: new URL("https://alltools.network"),
  alternates: { canonical: "/trending-tools/lorem-ipsum-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Lorem Ipsum Generator",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  url: "https://alltools.example/tools/lorem-ipsum-generator",
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
      name: "Is the Lorem Ipsum Generator free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, the Lorem Ipsum Generator is completely free to use with no sign-up required.",
      },
    },
    {
      "@type": "Question",
      name: "Can I customize the amount of text generated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can specify the number of paragraphs and words per paragraph to generate the desired amount of placeholder text.",
      },
    },
  ],
};

function page() {
  return (
    <div>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(jsonldFaq)}</script>
      <LoremPicsumGen />
    </div>
  );
}

export default page;

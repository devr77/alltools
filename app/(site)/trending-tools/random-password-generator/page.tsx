import type { Metadata } from "next";
import RandomPasswordGen from "./RandomPasswordGen";

export const metadata: Metadata = {
  title: "Random Password Generator Simple and Free Online Tool | ToolsBase",
  description:
    "Generate strong, random passwords with customizable options. Choose length, include symbols, numbers, and more for enhanced security.",
  keywords: [
    "random password generator",
    "generate random password",
    "strong password generator",
    "secure password generator",
    "online password generator",
    "custom password generator",
    "free password generator",
  ],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/trending-tools/random-password-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Random Password Generator",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  url: "https://toolsbase.org/trending-tools/random-password-generator",
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
      name: "Is the Random Password Generator free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, the Random Password Generator is completely free to use with no sign-up required.",
      },
    },
    {
      "@type": "Question",
      name: "Can I customize the passwords generated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can customize the length and character types (such as symbols, numbers, uppercase, and lowercase letters) included in the generated passwords.",
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
      <RandomPasswordGen />
    </div>
  );
}

export default page;

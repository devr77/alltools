import type { Metadata } from "next";
import RandomNumGen from "./RandomNumGen";

export const metadata: Metadata = {
  title: "Random Number Generator Online Tool | AllTools",
  description:
    "Generate random numbers quickly and easily with our online tool. Perfect for games, simulations, and decision making.",
  keywords: [
    "random number generator",
    "generate random numbers",
    "online random number tool",
    "random number picker",
    "free random number generator",
  ],
  publisher: "AllTools Network",
  metadataBase: new URL("https://alltools.network"),
  alternates: { canonical: "/trending-tools/random-number-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Random Number Generator",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  url: "https://alltools.example/tools/random-number-generator",
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
      name: "Is the Random Number Generator free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, the Random Number Generator is completely free to use with no sign-up required.",
      },
    },
    {
      "@type": "Question",
      name: "What range of numbers can I generate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can generate random numbers within any range you specify, including both integers and decimals.",
      },
    },
    {
      "@type": "Question",
      name: "Can I generate multiple random numbers at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can specify how many random numbers you want to generate in a single operation.",
      },
    },
  ],
};

function page() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonldFaq) }}
      />
      <RandomNumGen />
    </div>
  );
}

export default page;

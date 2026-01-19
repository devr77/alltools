import type { Metadata } from "next";
import RandomUsernameGen from "./RandomUsernameGen";

export const metadata: Metadata = {
  title: "Random Username Generator Simple and Free Online Tool | ToolsBase",
  description:
    "Generate unique and random usernames easily with our free online tool. Customize length, add numbers, and include your own words for personalized usernames.",
  keywords: [
    "random username generator",
    "username generator",
    "generate username",
    "free username generator",
    "unique username",
    "online username tool",
    "custom username",
  ],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/trending-tools/random-username-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Random Username Generator",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  url: "https://toolsbase.org/tools/random-username-generator",
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
      name: "Is the Random Username Generator free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, the Random Username Generator is completely free to use with no sign-up required.",
      },
    },
    {
      "@type": "Question",
      name: "Can I customize the usernames generated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can customize the length of the username, include numbers, and add your own words to create personalized usernames.",
      },
    },
    {
      "@type": "Question",
      name: "How does the Random Username Generator work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The generator uses algorithms to combine letters, numbers, and your input words to create unique and random usernames.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use the generated usernames for commercial purposes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can use the generated usernames for both personal and commercial purposes without any restrictions.",
      },
    },
  ],
};

function page() {
  return (
    <div>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(jsonldFaq)}</script>
      <RandomUsernameGen />
    </div>
  );
}

export default page;

import type { Metadata } from "next";
import RandomChoicepicker from "./RandomChoicepicker";

export const metadata: Metadata = {
  title: "Random Choice Picker Online Tool | ToolsBase",
  description:
    "Pick a random choice from your list with this easy-to-use online tool. Perfect for decision making and fun!",
  keywords: [
    "random choice picker",
    "random picker",
    "choice picker",
    "random selection tool",
    "decision maker",
    "online random picker",
    "free random choice picker",
  ],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/trending-tools/random-choice-picker" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Random Choice Picker",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  url: "https://toolsbase.org/trending-tools/random-choice-picker",

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
      name: "Is the Random Choice Picker free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, the Random Choice Picker is completely free to use with no sign-up required.",
      },
    },
    {
      "@type": "Question",
      name: "How many choices can I enter?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can enter as many choices as you like. The more choices you add, the more fun it gets!",
      },
    },
    {
      "@type": "Question",
      name: "Can I use the Random Choice Picker on my mobile device?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, the tool is fully responsive and works great on both desktop and mobile devices.",
      },
    },
  ],
};

function page() {
  return (
    <div>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(jsonldFaq)}</script>
      <RandomChoicepicker />
    </div>
  );
}

export default page;

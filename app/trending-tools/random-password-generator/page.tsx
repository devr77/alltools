import type { Metadata } from "next";
import RandomPasswordGen from "./RandomPasswordGen";

export const metadata: Metadata = {
  title: "Random Password Generator Simple and Free Online Tool | AllTools",
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
  publisher: "AllTools Network",
  metadataBase: new URL("https://alltools.network"),
  alternates: { canonical: "/trending-tools/random-password-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <div>
      <RandomPasswordGen />
    </div>
  );
}

export default page;

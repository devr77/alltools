import type { Metadata } from "next";
import QRCodeGeneratorPage from "./QrCodeGenerator";

export const metadata: Metadata = {
  title: "QR Code Generator Simple and Free Online Tool | ToolsBase",
  description:
    "Create QR codes for links, text, or any content. Adjust size, margin, and error correction, then copy or download the image.",
  keywords: [
    "qr code generator",
    "generate qr code",
    "qr code maker",
    "qr code creator",
    "online qr code",
    "qr code tool",
    "free qr code",
    "custom qr code",
  ],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/trending-tools/qr-code-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "QR Code Generator",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web",
  url: "https://toolsbase.org/trending-tools/qr-code-generator",
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
      name: "Is the QR Code Generator free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, the QR Code Generator is completely free to use with no sign-up required.",
      },
    },
    {
      "@type": "Question",
      name: "What types of QR codes can I generate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can generate QR codes for URLs, text, email addresses, phone numbers, Wi-Fi credentials, and more.",
      },
    },
    {
      "@type": "Question",
      name: "Do you store the generated QR codes or data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, all QR codes are generated instantly in your browser and no data is stored on our servers.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use the generated QR codes for commercial purposes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can use the generated QR codes for both personal and commercial purposes without restrictions.",
      },
    },
  ],
};

function page() {
  return (
    <>
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
      <QRCodeGeneratorPage />
    </>
  );
}

export default page;

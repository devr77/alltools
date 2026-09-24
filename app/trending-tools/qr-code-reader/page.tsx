import type { Metadata } from "next";
import QrCodeReader from "./QrCodeReader";
import { qrReaderFaqs } from "./faqs";

const title = "QR Code Reader – Scan a QR Code From an Image Online | ToolsBase";
const description = "Upload or paste a QR code image, or scan with your camera, to extract the link, text, Wi‑Fi password, or contact inside. Batch decode and export CSV. Free.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["qr code reader", "qr code scanner online", "scan qr code from image", "qr code decoder", "extract data from qr code", "read qr code from screenshot"],
  alternates: { canonical: "/trending-tools/qr-code-reader" },
  openGraph: { title, description, url: "/trending-tools/qr-code-reader" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "QR Code Reader",
      description,
      url: "https://toolsbase.org/trending-tools/qr-code-reader",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any (web browser)",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: qrReaderFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <QrCodeReader />
    </>
  );
}

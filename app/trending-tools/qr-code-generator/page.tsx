import type { Metadata } from "next";
import QRCodeGeneratorPage from "./QrCodeGenerator";

export const metadata: Metadata = {
  title: "QR Code Generator Simple and Free Online Tool | AllTools",
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
  publisher: "AllTools Network",
  metadataBase: new URL("https://alltools.network"),
  alternates: { canonical: "/trending-tools/qr-code-generator" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

function page() {
  return (
    <>
      <QRCodeGeneratorPage />
    </>
  );
}

export default page;

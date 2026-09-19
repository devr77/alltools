import "./globals.css";
import type { Metadata } from "next";
import { PostHogProvider } from "./provider";
import { GoogleTagManager } from "@next/third-parties/google";
import SiteHeader from "./components/SiteHeader";

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ToolsBase",
  alternateName: "ToolsBase",
  url: "https://toolsbase.org/",
};

// Fallback metadata for any route that does not export its own.
// A page's `metadata` export overrides these fields.
export const metadata: Metadata = {
  title: "ToolsBase | A collection of useful online tools",
  description:
    "ToolsBase is a fast, free online tools website offering 500+ utilities for developers, creators, and everyday tasks. Simple, clean, and clutter-free.",
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-adsense-account"
          content="ca-pub-2636230803963138"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
      </head>
      <body className="bg-white text-gray-900 min-h-screen flex flex-col">
        <GoogleTagManager gtmId="GTM-N8G5XC2K" />

        <SiteHeader />

        <main className="max-w-7xl xl:max-w-screen-2xl mx-auto px-4 py-10 flex-1">
          <PostHogProvider>{children}</PostHogProvider>
        </main>
        <footer className="border-t border-gray-200 mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-muted space-y-3">
            <p>© {new Date().getFullYear()} ToolsBase. All rights reserved.</p>

            <p className="max-w-3xl">
              ToolsBase provides free online utilities for developers, creators,
              and general use. Tools are offered "as is" without warranties of
              any kind. Use at your own discretion.
            </p>

            <p>
              Not affiliated with any third-party brands or services mentioned.
            </p>

            {/* Legal & Info Links */}
            <p className="flex flex-wrap gap-4">
              <a href="/privacy" className="hover:underline underline-offset-4">
                Privacy Policy
              </a>
              <span>·</span>
              <a href="/about" className="hover:underline underline-offset-4">
                About
              </a>
              <span>·</span>
              <a href="/contact" className="hover:underline underline-offset-4">
                Contact
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

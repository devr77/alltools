import "./globals.css";
import type { Metadata } from "next";
import { PostHogProvider } from "./provider";
import { GoogleTagManager } from "@next/third-parties/google";

// Fallback metadata for any route that does not export its own.
// A page's `metadata` export overrides these fields.
export const metadata: Metadata = {
  title: "ToolsBase | A collection of useful online tools",
  description:
    "ToolsBase is a fast, free online tools website offering useful utilities for developers, creators, and everyday tasks. Simple, clean, and clutter-free.",
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

// Header and footer live in section layouts: app/(site)/layout.tsx for the main site, app/share/layout.tsx for Share.
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
      </head>
      <body className="bg-white text-gray-900 min-h-screen flex flex-col">
        <GoogleTagManager gtmId="GTM-N8G5XC2K" />

        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}

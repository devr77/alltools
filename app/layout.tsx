"use client";

import "./globals.css";
import { PostHogProvider } from "./provider";
import { GoogleTagManager } from "@next/third-parties/google";
import MobileSidebar from "./components/MobileSidebar";
import { useState } from "react";

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ToolsBase",
  alternateName: "ToolsBase",
  url: "https://toolsbase.org/",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
      </head>
      <body className="bg-white text-gray-900 min-h-screen flex flex-col">
        <GoogleTagManager gtmId="GTM-N8G5XC2K" />

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <header className="border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center">
              {/* Hamburger Menu Button - Only visible on mobile */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="mr-3 p-2 -ml-2 lg:hidden hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Open navigation menu"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <a className="font-semibold" href="/">
                ToolsBase
              </a>
            </div>

            <nav className="text-sm text-muted space-x-6">
              <a href="/">Tools</a>
            </nav>
          </div>
        </header>

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

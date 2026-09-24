"use client";

import { useState } from "react";
import Link from "next/link";
import MobileSidebar from "./MobileSidebar";

export default function SiteHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <header className="border-b border-gray-200">
        <div className="max-w-[1184px] mx-auto px-4 h-16 flex items-center justify-between">
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

            <Link className="font-semibold text-lg tracking-tight" href="/">
              ToolsBase
            </Link>
          </div>

          <nav aria-label="Main navigation" className="text-sm text-muted flex items-center gap-5">
            <Link href="/#tool-directory">All tools</Link>
            <Link href="/about">About</Link>
          </nav>
        </div>
      </header>
    </>
  );
}

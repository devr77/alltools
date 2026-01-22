import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact ToolsBase - Get in Touch",
  description:
    "Contact ToolsBase for questions, feedback, or suggestions about our online tools platform. We're here to help with your development and productivity needs.",
  keywords: ["contact toolsbase", "support", "feedback", "help"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/contact" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8">
      {/* HEADER */}
      <section>
        <h1 className="text-4xl font-semibold mb-4">Contact Us</h1>
        <p className="text-zinc-500">
          Have a question, feedback, or suggestion? We’d love to hear from you.
        </p>
      </section>

      {/* CONTACT INFO */}
      <section className="space-y-4">
        <p className="text-zinc-600">
          For general inquiries, bug reports, feature requests, or business
          communication, please contact us via email:
        </p>

        <p className="text-lg font-medium">
          <a
            href="mailto:support@alltools.network"
            className="underline underline-offset-4 hover:opacity-80"
          >
            support@alltools.network
          </a>
        </p>

        <p className="text-sm text-zinc-500">
          We aim to respond within a reasonable timeframe. Please avoid sending
          sensitive or confidential information via email.
        </p>
      </section>
    </div>
  );
}

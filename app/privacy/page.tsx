import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - ToolsBase",
  description:
    "Read ToolsBase's privacy policy. Learn how we collect, use, and protect your data when using our free online tools platform.",
  keywords: ["privacy policy", "data protection", "privacy", "toolsbase privacy"],
  publisher: "ToolsBase Network",
  metadataBase: new URL("https://toolsbase.org"),
  alternates: { canonical: "/privacy" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      {/* HEADER */}
      <section>
        <h1 className="text-4xl font-semibold mb-4">Privacy Policy</h1>
        <p className="text-zinc-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </section>

      {/* INTRO */}
      <section className="space-y-4">
        <p className="text-zinc-600">
          At <strong>ToolsBase</strong>, your privacy is important to us. This
          Privacy Policy explains how we collect, use, and protect information
          when you use our website and online tools.
        </p>
        <p className="text-zinc-600">
          By using ToolsBase, you agree to the practices described in this
          policy.
        </p>
      </section>

      {/* INFORMATION COLLECTION */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Information We Collect</h2>

        <p className="text-zinc-600">
          ToolsBase is designed to work without requiring personal information.
          Most tools operate entirely within your browser.
        </p>

        <ul className="list-disc pl-6 text-zinc-600">
          <li>
            <strong>No personal data:</strong> We do not require account
            registration or personal details to use our tools.
          </li>
          <li>
            <strong>No tool input storage:</strong> Data you enter into tools is
            not stored on our servers.
          </li>
          <li>
            <strong>Basic analytics:</strong> We may collect anonymous usage
            statistics (such as page views or tool popularity) to improve
            performance and usability.
          </li>
        </ul>
      </section>

      {/* HOW DATA IS USED */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How We Use Information</h2>

        <p className="text-zinc-600">
          Any collected information is used solely to:
        </p>

        <ul className="list-disc pl-6 text-zinc-600">
          <li>Improve website performance and reliability</li>
          <li>Understand which tools are most useful</li>
          <li>Fix bugs and enhance user experience</li>
        </ul>

        <p className="text-zinc-600">
          We do not sell, rent, or share user data with third parties.
        </p>
      </section>

      {/* COOKIES */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Cookies</h2>

        <p className="text-zinc-600">
          ToolsBase may use minimal cookies or similar technologies to:
        </p>

        <ul className="list-disc pl-6 text-zinc-600">
          <li>Remember basic preferences</li>
          <li>Measure anonymous traffic patterns</li>
        </ul>

        <p className="text-zinc-600">
          You can disable cookies in your browser settings, though some features
          may not function as intended.
        </p>
      </section>

      {/* THIRD PARTY */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Third-Party Services</h2>

        <p className="text-zinc-600">
          We may use third-party services such as analytics or advertising
          providers. These services may collect information according to their
          own privacy policies.
        </p>

        <p className="text-zinc-600">
          ToolsBase is not responsible for the privacy practices of third-party
          websites or services linked from our platform.
        </p>
      </section>

      {/* DATA SECURITY */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Data Security</h2>

        <p className="text-zinc-600">
          We take reasonable measures to protect the website and its users.
          However, no method of transmission or storage is 100% secure.
        </p>

        <p className="text-zinc-600">
          Use ToolsBase at your own discretion, especially for sensitive or
          critical data.
        </p>
      </section>

      {/* CHILDREN */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Children’s Information</h2>

        <p className="text-zinc-600">
          ToolsBase does not knowingly collect any personal information from
          children under the age of 13. If you believe a child has provided
          personal data, please contact us so we can remove it.
        </p>
      </section>

      {/* CHANGES */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Changes to This Policy</h2>

        <p className="text-zinc-600">
          We may update this Privacy Policy from time to time. Any changes will
          be reflected on this page with an updated revision date.
        </p>
      </section>

      {/* CONTACT */}
      <section className="space-y-4 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold">Contact Us</h2>

        <p className="text-zinc-600">
          If you have any questions about this Privacy Policy or our practices,
          you can contact us through the website.
        </p>
      </section>
    </div>
  );
}

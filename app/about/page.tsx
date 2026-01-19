import React from "react";

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      {/* HERO */}
      <section>
        <h1 className="text-4xl font-semibold mb-4">About ToolsBase</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg">
          Simple tools. Zero clutter. Built for speed, privacy, and reliability.
        </p>
      </section>

      {/* WHO WE ARE */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Who We Are</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          ToolsBase is a modern online utilities platform created to solve a
          simple problem: most online tools today are slow, bloated, ad-heavy,
          or filled with distractions. We wanted to build a clean, fast, and
          reliable place where anyone can access useful tools instantly.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          Our platform brings together hundreds of carefully designed tools for
          developers, creators, students, and professionals — all in one place,
          with a consistent and minimal user experience.
        </p>
      </section>

      {/* WHAT WE OFFER */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">What We Offer</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          ToolsBase provides over 500 free online tools across multiple
          categories, including:
        </p>

        <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2">
          <li>
            Developer tools (JSON formatters, encoders, decoders, validators)
          </li>
          <li>Text and content utilities</li>
          <li>Converters and calculators</li>
          <li>Media and file-related tools</li>
          <li>Everyday productivity utilities</li>
        </ul>

        <p className="text-zinc-600 dark:text-zinc-400">
          Every tool is designed to be fast, intuitive, and usable without
          registration or unnecessary steps.
        </p>
      </section>

      {/* PHILOSOPHY */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Our Philosophy</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          We strongly believe that tools should help you focus on your task —
          not distract you from it. That’s why ToolsBase follows a strict design
          and product philosophy:
        </p>

        <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2">
          <li>Minimal and distraction-free interface</li>
          <li>No forced sign-ups</li>
          <li>No dark patterns or intrusive popups</li>
          <li>Privacy-first approach</li>
          <li>Performance over visual noise</li>
        </ul>
      </section>

      {/* PRIVACY */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Privacy & Data Usage</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Privacy is a core principle at ToolsBase. Most tools run entirely in
          your browser and do not send your data to our servers. We do not
          store, analyze, or sell user-generated content.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          Any analytics we use are focused solely on improving performance,
          usability, and reliability — never on tracking individual users.
        </p>
      </section>

      {/* RELIABILITY */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Accuracy & Reliability</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          While we work hard to ensure accuracy and correctness, all tools on
          ToolsBase are provided “as is” without warranties of any kind. Results
          should be verified independently when used for critical or
          professional purposes.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          We continuously review, update, and improve tools based on feedback
          and evolving standards.
        </p>
      </section>

      {/* FUTURE */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Our Vision</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Our long-term goal is to make ToolsBase the most trusted and
          accessible tools platform on the web. We plan to continue expanding
          our library, improving performance, and introducing APIs and advanced
          features for power users — all while keeping the core experience free
          and simple.
        </p>
      </section>

      {/* DISCLAIMER */}
      <section className="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-8">
        <h2 className="text-xl font-semibold">Disclaimer</h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          ToolsBase is an independent platform and is not affiliated with any
          third-party brands, services, or organizations mentioned on this
          website. Tool names are used for descriptive purposes only.
        </p>
      </section>
    </div>
  );
}

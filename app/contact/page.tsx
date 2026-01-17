import React from "react";

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8">
      {/* HEADER */}
      <section>
        <h1 className="text-4xl font-semibold mb-4">Contact Us</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Have a question, feedback, or suggestion? We’d love to hear from you.
        </p>
      </section>

      {/* CONTACT INFO */}
      <section className="space-y-4">
        <p className="text-zinc-600 dark:text-zinc-400">
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

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          We aim to respond within a reasonable timeframe. Please avoid sending
          sensitive or confidential information via email.
        </p>
      </section>
    </div>
  );
}

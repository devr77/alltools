"use client";
import posthog from "posthog-js";
import type { ReactNode } from "react";
import { categories } from "../Constants";
import { useState } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  // Get Trending Tools category
  const trendingToolsCategory = categories.find(
    (cat) => cat.slug === "data-convertor",
  );
  // Pick 3 random tools
  const similarTools = trendingToolsCategory
    ? [...trendingToolsCategory.tools]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
    : [];

  const [feedback, setFeedback] = useState<null | "like" | "dislike" | "share">(
    null,
  );

  const handleFeedback = (type: "like" | "dislike" | "share") => {
    posthog.capture("trending_tools_feedback", { type });
    setFeedback(type);
    if (type === "share") {
      if (typeof window !== "undefined" && window.navigator?.clipboard) {
        window.navigator.clipboard.writeText(window.location.href);
      }
    }
    // Optionally clear feedback after a timeout for share
    if (type === "share") {
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  return (
    <div>
      <nav className="mb-6">
        {/* Example navigation links */}
        <a href="/" className="text-blue-600 hover:underline mr-4">
          Home
        </a>{" "}
        /{" "}
        <a href="/data-convertor" className="text-blue-600 hover:underline">
          Data Convertor
        </a>
      </nav>
      {children}
      <div className="mt-8 flex flex-col items-start gap-2">
        <span className="font-medium">Did you find this tool useful?</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex items-center px-3 py-1.5 rounded hover:bg-gray-100 transition text-lg"
            aria-label="Like"
            onClick={() => handleFeedback("like")}
            disabled={feedback === "like"}
          >
            👍
          </button>
          <button
            type="button"
            className="flex items-center px-3 py-1.5 rounded hover:bg-gray-100 transition text-lg"
            aria-label="Dislike"
            onClick={() => handleFeedback("dislike")}
            disabled={feedback === "dislike"}
          >
            👎
          </button>
          <button
            type="button"
            className="flex items-center px-3 py-1.5 rounded hover:bg-gray-100 transition text-lg"
            aria-label="Share"
            onClick={() => handleFeedback("share")}
            disabled={feedback === "share"}
          >
            🔗
          </button>
        </div>
        {feedback === "like" && (
          <span className="text-green-600 text-sm mt-1">
            Thanks for your feedback! 👍
          </span>
        )}
        {feedback === "dislike" && (
          <span className="text-red-600 text-sm mt-1">
            Thanks for your feedback! 👎
          </span>
        )}
        {feedback === "share" && (
          <span className="text-blue-600 text-sm mt-1">
            Link copied to clipboard!
          </span>
        )}
      </div>
      {/* Similar Tools Section */}
      {similarTools.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Similar Tools</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {similarTools.map((tool) => (
              <a
                key={tool.slug}
                href={`/data-convertor/${tool.slug}`}
                className="border border-border bg-card p-4 rounded-md hover:border-white transition"
              >
                <h3 className="font-medium flex items-center">
                  <span className="mr-2">{tool.icon}</span>
                  {tool.name}
                </h3>
                <p className="text-sm text-muted mt-1">Open tool →</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState } from "react";
import TurndownService from "turndown";
import FAQSection from "@/app/components/FAQSection";
import { dataConverterFAQs } from "@/app/components/faqData";

function HtmltoMarkdown() {
  const [html, setHtml] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const supportedTags = [
    "<h1>",
    "<h2>",
    "<h3>",
    "<p>",
    "<strong>",
    "<em>",
    "<ul>",
    "<ol>",
    "<li>",
    "<br>",
  ];

  // Use Turndown for conversion
  const handleConvert = () => {
    setLoading(true);
    setTimeout(() => {
      const turndownService = new TurndownService();
      const md = turndownService.turndown(html);
      setMarkdown(md.trim());
      setLoading(false);
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 4 }}>
          HTML to Markdown Converter Tool
        </h1>
        <span
          style={{ position: "relative", cursor: "pointer" }}
          onMouseEnter={() => setShowTags(true)}
          onMouseLeave={() => setShowTags(false)}
          tabIndex={0}
        >
          {/* Info icon SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            fill="none"
            viewBox="0 0 24 24"
            style={{ verticalAlign: "middle" }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#0070f3"
              strokeWidth="2"
              fill="white"
            />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fontSize="12"
              fill="#0070f3"
              fontFamily="Arial"
              fontWeight="bold"
            >
              ?
            </text>
          </svg>
          {showTags && (
            <div
              style={{
                position: "absolute",
                top: "120%",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#fff",
                border: "1px solid #0070f3",
                borderRadius: "6px",
                boxShadow: "0 2px 8px rgba(0,112,243,0.08)",
                padding: "10px 16px",
                zIndex: 10,
                minWidth: "180px",
                fontSize: "0.95em",
                color: "#222",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 6,
                  color: "#0070f3",
                }}
              >
                Supported HTML tags:
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {supportedTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "#e0e7ff",
                      color: "#3730a3",
                      borderRadius: "4px",
                      padding: "2px 8px",
                      fontFamily: "monospace",
                      fontSize: "0.97em",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </span>
      </div>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 500, marginBottom: 18 }}>
        Convert HTML code to Markdown format instantly
      </h2>
      <textarea
        rows={8}
        placeholder="Paste your HTML here..."
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        style={{
          width: "100%",
          fontFamily: "monospace",
          outline: "2px solid #0070f3",
          outlineOffset: "2px",
          borderRadius: "5px",
          border: "1px solid #d1d5db",
          padding: "8px",
          marginBottom: "12px",
        }}
      />
      <br />
      <button
        onClick={handleConvert}
        disabled={!html || loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          border: "2px solid #0070f3",
          background: loading ? "#e0e7ff" : "white",
          color: "#0070f3",
          padding: "8px 18px",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 500,
          marginBottom: 12,
          gap: 8,
        }}
      >
        {/* Convert icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 16V4"
            stroke="#0070f3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {loading ? "Converting..." : "Convert to Markdown"}
      </button>
      {markdown && !loading && (
        <div style={{ marginTop: 20 }}>
          <h3>Converted Markdown</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <textarea
              rows={12}
              cols={60}
              value={markdown}
              readOnly
              style={{ width: "100%", fontFamily: "monospace" }}
            />
            <button
              onClick={handleCopy}
              style={{
                border: "2px solid #0070f3",
                background: copied ? "#0070f3" : "white",
                color: copied ? "white" : "#0070f3",
                padding: "8px",
                borderRadius: "5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontWeight: 500,
                minWidth: 40,
                height: 40,
              }}
              title="Copy to clipboard"
            >
              {/* Copy icon SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
              >
                <rect
                  x="9"
                  y="9"
                  width="13"
                  height="13"
                  rx="2"
                  stroke={copied ? "white" : "#0070f3"}
                  strokeWidth="2"
                  fill="none"
                />
                <rect
                  x="3"
                  y="3"
                  width="13"
                  height="13"
                  rx="2"
                  stroke={copied ? "white" : "#0070f3"}
                  strokeWidth="2"
                  fill="none"
                  opacity="0.5"
                />
              </svg>
              {copied ? "Copied!" : ""}
            </button>
            <button
              onClick={handleDownload}
              style={{
                border: "2px solid #0070f3",
                background: "white",
                color: "#0070f3",
                padding: "8px",
                borderRadius: "5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontWeight: 500,
                minWidth: 40,
                height: 40,
              }}
              title="Download Markdown"
            >
              {/* Download SVG icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                  stroke="#0070f3"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="7 10 12 15 17 10"
                  stroke="#0070f3"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="12"
                  y1="15"
                  x2="12"
                  y2="3"
                  stroke="#0070f3"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download
            </button>
          </div>
        </div>
      )}
      <FAQSection faqs={dataConverterFAQs} />
    </div>
  );
}

export default HtmltoMarkdown;

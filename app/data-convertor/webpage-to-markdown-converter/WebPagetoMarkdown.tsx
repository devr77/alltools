"use client";
import React, { useState } from "react";
import FAQSection from "../../components/FAQSection";
import { dataConverterFAQs } from "../../components/faqData";

function WebPagetoMarkdown() {
  const [url, setUrl] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = async () => {
    if (!url) return;

    setLoading(true);
    setError("");
    setMarkdown("");

    try {
      const res = await fetch("/api/web-to-markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Conversion failed");
      }

      setMarkdown(data.markdown);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlObj;
    a.download = "converted.md";
    a.click();
    URL.revokeObjectURL(urlObj);
  };

  const handleCopy = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setCopied(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 4 }}>
        Webpage to Markdown Converter Tool
      </h1>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 500, marginBottom: 18 }}>
        Convert any webpage URL to Markdown format instantly
      </h2>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
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
        disabled={!url || loading}
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

export default WebPagetoMarkdown;

"use client";
import React, { useState } from "react";
import urlsMd from "urls-md";
import FAQSection from "../../components/FAQSection";
import { trendingToolsFAQs } from "../../components/faqData";

function UrltoMarkdown() {
  const [inputText, setInputText] = useState("");
  const [markdownOutput, setMarkdownOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | "">("");

  const handleConvert = async () => {
    const text = inputText.trim();
    if (!text) {
      setError("Please enter some text containing URLs.");
      return;
    }

    setLoading(true);
    setError("");
    setMarkdownOutput("");
    setCopied(false);

    try {
      const result = await urlsMd(text);

      if (!result || result.length === 0) {
        setError("No URLs were found in the provided text.");
        return;
      }

      // Join each generated Markdown link/image with a blank line
      setMarkdownOutput(result.join("\n\n"));
    } catch (err: any) {
      setError(err?.message || "Conversion failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!markdownOutput) return;
    try {
      await navigator.clipboard.writeText(markdownOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (!markdownOutput) return;

    const blob = new Blob([markdownOutput], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "urls-to-markdown.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        width: "100%",
        margin: "2rem auto",
        padding: 32,
        border: "1px solid #ccc",
        borderRadius: 12,
        background: "#fff",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ fontSize: "2em", marginBottom: 8 }}>
        URL to Markdown Converter
      </h1>
      <h2
        style={{
          fontSize: "1.1em",
          fontWeight: "normal",
          marginBottom: 20,
        }}
      >
        Paste any text with URLs and instantly convert them into Markdown links
        and images, powered by the urls-md library.
      </h2>

      <label
        htmlFor="url-input"
        style={{ display: "block", fontWeight: "bold", marginBottom: 8 }}
      >
        Input text containing URLs
      </label>
      <textarea
        id="url-input"
        rows={6}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={
          "Paste your link dump here...\n" +
          "Example: Lorem ipsum http://example.com/article\n" +
          "https://example.com/image.png"
        }
        style={{
          width: "100%",
          fontFamily: "monospace",
          borderRadius: 6,
          border: "1px solid #d1d5db",
          outline: "2px solid #1976d2",
          outlineOffset: 2,
          padding: 10,
          boxSizing: "border-box",
          marginBottom: 12,
        }}
      />

      {error && (
        <div
          style={{
            color: "#b91c1c",
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: 6,
            padding: "8px 10px",
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          border: "2px solid #1976d2",
          background: loading ? "#e0e7ff" : "#fff",
          color: "#1976d2",
          padding: "8px 18px",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 600,
          gap: 8,
          marginBottom: 16,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 16V4"
            stroke="#1976d2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {loading ? "Converting..." : "Convert URLs to Markdown"}
      </button>

      {markdownOutput && !loading && (
        <div style={{ marginTop: 8 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>
            Converted Markdown
          </h3>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <textarea
              rows={10}
              value={markdownOutput}
              readOnly
              style={{
                width: "100%",
                fontFamily: "monospace",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                padding: 10,
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                minWidth: 110,
              }}
            >
              <button
                onClick={handleCopy}
                style={{
                  border: "2px solid #1976d2",
                  background: copied ? "#1976d2" : "#fff",
                  color: copied ? "#fff" : "#1976d2",
                  padding: "8px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontWeight: 600,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <rect
                    x="7"
                    y="7"
                    width="9"
                    height="11"
                    rx="2"
                    stroke={copied ? "#fff" : "#1976d2"}
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <rect
                    x="4"
                    y="2"
                    width="9"
                    height="11"
                    rx="2"
                    stroke={copied ? "#fff" : "#1976d2"}
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
                {copied ? "Copied!" : "Copy"}
              </button>

              <button
                onClick={handleDownload}
                style={{
                  border: "2px solid #1976d2",
                  background: "#fff",
                  color: "#1976d2",
                  padding: "8px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontWeight: 600,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                    stroke="#1976d2"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="7 10 12 15 17 10"
                    stroke="#1976d2"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="12"
                    y1="15"
                    x2="12"
                    y2="3"
                    stroke="#1976d2"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 32 }}>
        <FAQSection faqs={trendingToolsFAQs} />
      </div>
    </div>
  );
}

export default UrltoMarkdown;

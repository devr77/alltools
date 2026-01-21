"use client";
import React, { useState } from "react";
// Import mammoth
import mammoth from "mammoth";
// Import unified, remark-parse, and remark-stringify for beautification
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import FAQSection from "../../components/FAQSection";
import { dataConverterFAQs } from "../../components/faqData";

function DocstoMarkdown() {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use mammoth to convert DOCX to Markdown
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToMarkdown({ arrayBuffer });
      setMarkdown(result.value);
    } catch (err) {
      setMarkdown(
        `# Conversion Failed\n\n*Could not convert DOCX to Markdown. Please try another file.*`,
      );
    }
    setLoading(false);
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

  // Beautify/format the markdown using unified + remark
  const handleBeautify = async () => {
    if (!markdown) return;
    try {
      const file = await unified()
        .use(remarkParse)
        .use(remarkStringify)
        .process(markdown);
      setMarkdown(String(file));
    } catch (err) {
      // fallback: do nothing
    }
  };

  return (
    <div>
      <h2>DOCX to Markdown Converter</h2>
      {/* Outlined upload button with icon */}
      <label
        htmlFor="docx-upload"
        style={{
          display: "inline-flex",
          alignItems: "center",
          border: "2px solid #0070f3",
          background: "white",
          color: "#0070f3",
          padding: "8px 18px",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 500,
          marginBottom: 12,
          gap: 8,
        }}
      >
        {/* Upload icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 16V4M12 4l-5 5M12 4l5 5"
            stroke="#0070f3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="4"
            y="16"
            width="16"
            height="4"
            rx="2"
            stroke="#0070f3"
            strokeWidth="2"
            fill="none"
          />
        </svg>
        {loading ? "Uploading..." : "Upload DOCX"}
      </label>
      <input
        id="docx-upload"
        type="file"
        accept=".docx"
        onChange={handleFileChange}
        disabled={loading}
        style={{ display: "none" }}
      />
      {loading && <div>Converting...</div>}
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
            {/* Beautify Markdown button */}
            <button
              onClick={handleBeautify}
              style={{
                border: "2px solid #10b981",
                background: "white",
                color: "#10b981",
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
              title="Beautify Markdown"
            >
              {/* Sparkle icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Beautify
            </button>
          </div>
        </div>
      )}
      <FAQSection faqs={dataConverterFAQs} />
    </div>
  );
}

export default DocstoMarkdown;

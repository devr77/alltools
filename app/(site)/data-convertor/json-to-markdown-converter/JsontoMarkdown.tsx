"use client";
import React, { useState, useRef } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import FAQSection from "@/app/components/FAQSection";
import { dataConverterFAQs } from "@/app/components/faqData";

function jsonToMarkdown(obj: any, indent = 0): string {
  if (typeof obj !== "object" || obj === null) {
    return String(obj);
  }
  if (Array.isArray(obj)) {
    return obj
      .map(
        (item) => `${"  ".repeat(indent)}- ${jsonToMarkdown(item, indent + 1)}`,
      )
      .join("\n");
  }
  return Object.entries(obj)
    .map(
      ([key, value]) =>
        `${"  ".repeat(indent)}- **${key}**: ${
          typeof value === "object" && value !== null
            ? "\n" + jsonToMarkdown(value, indent + 1)
            : String(value)
        }`,
    )
    .join("\n");
}

function JsontoMarkdown() {
  const [jsonInput, setJsonInput] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConvert = () => {
    setError("");
    try {
      const parsed = JSON.parse(jsonInput);
      setMarkdown(jsonToMarkdown(parsed));
    } catch (e) {
      setMarkdown("");
      setError("Invalid JSON");
    }
  };

  const handleCopy = async () => {
    if (markdown) {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonInput(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    setJsonInput(text);
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
    <main
      style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: 16,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <section>
        <div style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
          JSON to Markdown Converter
        </div>
        <div style={{ fontSize: "1.2rem", marginBottom: 24 }}>
          Convert your JSON data to Markdown format easily. Paste, upload, or
          type your JSON below.
        </div>
        <label htmlFor="json-input" style={{ fontWeight: 600 }}>
          JSON Input
        </label>
        <textarea
          id="json-input"
          rows={8}
          style={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            marginBottom: 8,
            fontFamily: "monospace",
            fontSize: 15,
            boxSizing: "border-box",
            resize: "vertical",
          }}
          placeholder="Paste or type your JSON here"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          onPaste={handlePaste}
          aria-label="JSON Input"
        />
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 8,
          }}
        >
          <button
            type="button"
            onClick={handleConvert}
            style={{
              outline: "2px solid #0070f3",
              outlineOffset: 2,
              border: "none",
              background: "#0070f3",
              color: "#fff",
              padding: "8px 18px",
              borderRadius: 4,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Convert
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "1px solid #ccc",
              background: "#fafafa",
              color: "#333",
              padding: "8px 14px",
              borderRadius: 4,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ marginRight: 2 }}
            >
              <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
              <rect x="4" y="17" width="16" height="4" rx="2" />
            </svg>
            Upload JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: "none" }}
            onChange={handleFileUpload}
            aria-label="Upload JSON file"
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      </section>
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 24,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              flex: 1,
            }}
          >
            Markdown Output
          </div>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!markdown}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              border: "none",
              background: "#eaeaea",
              color: "#333",
              padding: "6px 12px",
              borderRadius: 4,
              fontWeight: 500,
              cursor: markdown ? "pointer" : "not-allowed",
              marginLeft: 8,
            }}
            aria-label="Copy Markdown"
            tabIndex={0}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ marginRight: 2 }}
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </svg>
            {copied ? "Copied!" : "Copy"}
          </button>
          {/* Beautify Markdown button */}
          <button
            type="button"
            onClick={handleBeautify}
            disabled={!markdown}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              border: "none",
              background: "#e0ffe6",
              color: "#059669",
              padding: "6px 12px",
              borderRadius: 4,
              fontWeight: 500,
              cursor: markdown ? "pointer" : "not-allowed",
              marginLeft: 8,
            }}
            aria-label="Beautify Markdown"
            tabIndex={0}
            title="Beautify Markdown"
          >
            {/* Sparkle icon */}
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="#059669"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{ marginRight: 2 }}
            >
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
            Beautify
          </button>
        </div>
        <textarea
          rows={10}
          style={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            background: "#f4f4f4",
            fontFamily: "monospace",
            fontSize: 15,
            resize: "vertical",
            marginBottom: 16,
          }}
          value={markdown}
          readOnly
          aria-label="Markdown Output"
        />
      </section>
      <style>{`
        @media (max-width: 600px) {
          main {
            padding: 8px !important;
          }
          textarea {
            font-size: 14px !important;
          }
          button {
            font-size: 14px !important;
            padding: 7px 10px !important;
          }
        }
      `}</style>
      <FAQSection faqs={dataConverterFAQs} />
    </main>
  );
}

export default JsontoMarkdown;

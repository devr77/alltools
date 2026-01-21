"use client";
import React, { useState } from "react";
import FAQSection from "../../components/FAQSection";
import { dataConverterFAQs } from "../../components/faqData";

function csvToMarkdown(csv: string): string {
  const rows = csv
    .trim()
    .split("\n")
    .map((row) => row.split(","));
  if (rows.length === 0) return "";

  const header = rows[0];
  const separator = header.map(() => "---");
  const body = rows.slice(1);

  const toRow = (cols: string[]) => `| ${cols.join(" | ")} |`;

  return [toRow(header), toRow(separator), ...body.map(toRow)].join("\n");
}

function CsvtoMarkdown() {
  const [csv, setCsv] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    setMarkdown(csvToMarkdown(csv));
  };

  const handleCopy = async () => {
    if (markdown) {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem 1rem",
        boxSizing: "border-box",
        background: "#fafbfc",
      }}
    >
      <h1
        style={{ fontSize: "2rem", marginBottom: "0.5em", textAlign: "center" }}
      >
        CSV to Markdown Converter
      </h1>
      <span
        style={{
          position: "absolute",
          left: "-10000px",
          top: "auto",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        Convert CSV data to a Markdown table easily and copy the result for your
        documentation or README files.
      </span>
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          padding: "2rem 1rem",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <textarea
          rows={8}
          style={{
            width: "100%",
            resize: "vertical",
            marginBottom: "1rem",
            fontFamily: "monospace",
            fontSize: "1rem",
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
          placeholder="Paste CSV here"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
        />
        <button
          style={{
            border: "1px solid #0070f3",
            background: "white",
            color: "#0070f3",
            padding: "10px 0",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "1.5rem",
            fontWeight: 600,
            fontSize: "1rem",
            width: "100%",
            transition: "background 0.2s",
          }}
          onClick={handleConvert}
        >
          Convert
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <h2 style={{ fontSize: "1.2rem", margin: 0, flex: 1 }}>
            Markdown Table
          </h2>
          <button
            onClick={handleCopy}
            style={{
              border: "1px solid #888",
              background: "white",
              color: "#333",
              padding: "4px 10px",
              borderRadius: "4px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.95rem",
              marginLeft: "8px",
            }}
            title="Copy to clipboard"
            disabled={!markdown}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              style={{ display: "inline", verticalAlign: "middle" }}
            >
              <rect
                x="9"
                y="9"
                width="13"
                height="13"
                rx="2"
                stroke="#333"
                strokeWidth="2"
                fill="none"
              />
              <rect
                x="3"
                y="3"
                width="13"
                height="13"
                rx="2"
                stroke="#333"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <textarea
          rows={8}
          style={{
            width: "100%",
            resize: "vertical",
            fontFamily: "monospace",
            fontSize: "1rem",
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
            marginBottom: 0,
          }}
          value={markdown}
          readOnly
        />
      </div>
      <FAQSection faqs={dataConverterFAQs} />
    </main>
  );
}

export default CsvtoMarkdown;

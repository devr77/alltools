"use client";
import React, { useState, useRef } from "react";
import FAQSection from "../../components/FAQSection";
import { dataConverterFAQs } from "../../components/faqData";
// Use papaparse for browser CSV parsing
import Papa from "papaparse";

function CsvJson() {
  const [csvInput, setCsvInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConvert = () => {
    setError("");
    try {
      const result = Papa.parse(csvInput, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });
      if (result.errors.length) {
        throw new Error(result.errors.map((e) => e.message).join("; "));
      }
      // Ensure output is valid JSON array
      setJsonOutput(JSON.stringify(result.data, null, 2));
    } catch (e: any) {
      setJsonOutput("");
      setError("Invalid CSV: " + e.message);
    }
  };

  const handleCopy = async () => {
    if (jsonOutput) {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  const handleDownload = () => {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvInput(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
        CSV to JSON Converter
      </h2>
      <textarea
        rows={8}
        style={{
          width: "100%",
          fontFamily: "monospace",
          fontSize: 15,
          marginBottom: 8,
        }}
        placeholder="Paste or type your CSV here"
        value={csvInput}
        onChange={(e) => setCsvInput(e.target.value)}
      />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={handleConvert}
          style={{
            background: "#0070f3",
            color: "#fff",
            padding: "8px 18px",
            borderRadius: 4,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Convert
        </button>
        <button
          onClick={handleCopy}
          disabled={!jsonOutput}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: copied ? "#0070f3" : "#eaeaea",
            color: copied ? "#fff" : "#333",
            padding: "8px 14px",
            borderRadius: 4,
            fontWeight: 500,
            border: "none",
            cursor: jsonOutput ? "pointer" : "not-allowed",
            transition: "background 0.2s",
          }}
          title="Copy JSON"
        >
          {/* Copy icon */}
          <svg
            width="18"
            height="18"
            fill="none"
            stroke={copied ? "#fff" : "#0070f3"}
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
        <button
          onClick={handleDownload}
          disabled={!jsonOutput}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "#eaeaea",
            color: "#0070f3",
            padding: "8px 14px",
            borderRadius: 4,
            fontWeight: 500,
            border: "none",
            cursor: jsonOutput ? "pointer" : "not-allowed",
            transition: "background 0.2s",
          }}
          title="Download JSON"
        >
          {/* Download icon */}
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="#0070f3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ marginRight: 2 }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "#fafafa",
            color: "#333",
            padding: "8px 14px",
            borderRadius: 4,
            fontWeight: 500,
            border: "1px solid #ccc",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          title="Upload CSV file"
        >
          {/* Upload icon */}
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="#0070f3"
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
          Upload CSV
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: "none" }}
          onChange={handleFileUpload}
          aria-label="Upload CSV file"
        />
      </div>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      <textarea
        rows={10}
        style={{
          width: "100%",
          background: "#f4f4f4",
          fontFamily: "monospace",
          fontSize: 15,
        }}
        value={jsonOutput}
        readOnly
        placeholder="Converted JSON will appear here"
      />
      <FAQSection faqs={dataConverterFAQs} />
    </main>
  );
}

export default CsvJson;

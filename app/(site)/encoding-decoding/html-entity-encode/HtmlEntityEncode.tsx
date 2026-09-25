"use client";
import React, { useState } from "react";
import FAQSection from "@/app/components/FAQSection";
import { encodingDecodingFAQs } from "@/app/components/faqData";

function HtmlEntityEncode() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const encodeHtmlEntities = (str: string) =>
    str.replace(/[\u00A0-\u9999<>&"'`]/gim, (i) => `&#${i.charCodeAt(0)};`);

  const handleEncode = () => {
    setOutput(encodeHtmlEntities(input));
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setCopied(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
        HTML Entity Encoder
      </h1>
      <textarea
        rows={6}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste or type HTML/text here..."
        style={{
          width: "100%",
          fontFamily: "monospace",
          border: "1px solid #d1d5db",
          borderRadius: 5,
          padding: 8,
          marginBottom: 12,
        }}
      />
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={handleEncode}
          disabled={!input}
          style={{
            border: "2px solid #0070f3",
            background: "#fff",
            color: "#0070f3",
            padding: "8px 16px",
            borderRadius: 5,
            fontWeight: 500,
            cursor: input ? "pointer" : "not-allowed",
          }}
        >
          Encode
        </button>
        <button
          onClick={handleClear}
          style={{
            border: "2px solid #e11d48",
            background: "#fff",
            color: "#e11d48",
            padding: "8px 16px",
            borderRadius: 5,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>
      <label style={{ fontWeight: 500 }}>Encoded Output:</label>
      <textarea
        rows={6}
        value={output}
        readOnly
        style={{
          width: "100%",
          fontFamily: "monospace",
          border: "1px solid #d1d5db",
          borderRadius: 5,
          padding: 8,
          marginBottom: 8,
          background: "#f9fafb",
        }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleCopy}
          disabled={!output}
          style={{
            border: "2px solid #0070f3",
            background: copied ? "#0070f3" : "#fff",
            color: copied ? "#fff" : "#0070f3",
            padding: "8px 16px",
            borderRadius: 5,
            fontWeight: 500,
            cursor: output ? "pointer" : "not-allowed",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export default HtmlEntityEncode;

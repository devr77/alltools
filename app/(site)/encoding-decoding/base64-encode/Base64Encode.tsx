"use client";
import React, { useState } from "react";
import FAQSection from "@/app/components/FAQSection";
import { encodingDecodingFAQs } from "@/app/components/faqData";

function Base64Encode() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    try {
      setOutput(btoa(unescape(encodeURIComponent(input))));
    } catch (e) {
      setOutput("Invalid input for Base64 encoding.");
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div>
      <h2>Base64 Encoder</h2>
      <label style={{ display: "block", marginBottom: "8px" }}>
        <span
          style={{ fontWeight: 500, display: "block", marginBottom: "4px" }}
        >
          Input Text
        </span>
        <textarea
          rows={5}
          cols={50}
          placeholder="Enter text to encode"
          value={input}
          style={{
            border: "1px solid #0070f3",
          }}
          onChange={(e) => setInput(e.target.value)}
        />
      </label>
      <br />
      <button
        onClick={handleEncode}
        style={{
          border: "1px solid #0070f3",
          background: "white",
          color: "#0070f3",
          padding: "6px 16px",
          borderRadius: "4px",
          cursor: "pointer",
          marginRight: "8px",
        }}
      >
        Encode
      </button>
      <button
        onClick={handleCopy}
        style={{
          border: "1px solid #888",
          background: "white",
          color: "#333",
          padding: "6px 16px",
          borderRadius: "4px",
          cursor: output ? "pointer" : "not-allowed",
          display: "inline-flex",
          alignItems: "center",
          opacity: output ? 1 : 0.5,
        }}
        disabled={!output}
        title="Copy to clipboard"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
          style={{ marginRight: 4 }}
        >
          <rect
            x="9"
            y="9"
            width="13"
            height="13"
            rx="2"
            stroke="#333"
            strokeWidth="2"
          />
          <rect
            x="3"
            y="3"
            width="13"
            height="13"
            rx="2"
            stroke="#333"
            strokeWidth="2"
          />
        </svg>
        {copied ? "Copied!" : "Copy"}
      </button>
      <br />
      <label style={{ display: "block", marginTop: "8px" }}>
        <span
          style={{ fontWeight: 500, display: "block", marginBottom: "4px" }}
        >
          Base64 Output
        </span>
        <textarea
          rows={5}
          cols={50}
          placeholder="Base64 output"
          value={output}
          readOnly
        />
      </label>
      {/* References / Citations */}
      <div style={{ marginTop: "24px", fontSize: "0.95em" }}>
        <h4>References</h4>
        <ul>
          <li>
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0070f3", textDecoration: "underline" }}
            >
              MDN Web Docs: btoa()
            </a>
          </li>
          <li>
            <a
              href="https://en.wikipedia.org/wiki/Base64"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0070f3", textDecoration: "underline" }}
            >
              Wikipedia: Base64
            </a>
          </li>
        </ul>
      </div>
      <FAQSection faqs={encodingDecodingFAQs} />
    </div>
  );
}

export default Base64Encode;

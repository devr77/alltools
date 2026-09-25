"use client";
import React, { useState } from "react";
import FAQSection from "@/app/components/FAQSection";
import { encodingDecodingFAQs } from "@/app/components/faqData";

function Base64decode() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleDecode = () => {
    setError("");
    try {
      // atob throws if input is not valid base64
      const decoded = atob(input);
      setOutput(decoded);
    } catch (e) {
      setOutput("");
      setError("Invalid Base64 string.");
    }
  };

  const handleCopy = async () => {
    if (output) {
      try {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } catch (e) {
        // Optionally handle clipboard error
      }
    }
  };

  return (
    <div>
      <h2>Base64 Decoder</h2>
      <textarea
        rows={4}
        cols={50}
        placeholder="Enter Base64 string"
        style={{
          border: "1px solid #0070f3",
        }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <br />
      <button
        onClick={handleDecode}
        style={{
          border: "2px solid #0070f3",
          background: "white",
          color: "#0070f3",
          padding: "6px 16px",
          borderRadius: "4px",
          cursor: "pointer",
          marginRight: "8px",
        }}
      >
        Decode
      </button>
      {/* Copy button with icon */}
      <button
        onClick={handleCopy}
        style={{
          border: "2px solid #888",
          background: "white",
          color: "#333",
          padding: "6px 12px",
          borderRadius: "4px",
          cursor: output ? "pointer" : "not-allowed",
          display: "inline-flex",
          alignItems: "center",
        }}
        disabled={!output}
        title="Copy decoded output"
      >
        {/* Simple copy icon (SVG) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 16 16"
          style={{ marginRight: 4 }}
        >
          <rect
            x="4"
            y="4"
            width="8"
            height="8"
            rx="2"
            stroke="#333"
            strokeWidth="1.5"
            fill="none"
          />
          <rect
            x="2.75"
            y="2.75"
            width="8.5"
            height="8.5"
            rx="2"
            stroke="#bbb"
            strokeWidth="1"
            fill="none"
          />
        </svg>
        {copied ? "Copied!" : "Copy"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div>
        <h3>Decoded Output:</h3>
        <pre>{output}</pre>
      </div>
      {/* References / Citations */}
      <div style={{ marginTop: "24px", fontSize: "0.95em" }}>
        <h4>References</h4>
        <ul>
          <li>
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/atob"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0070f3", textDecoration: "underline" }}
            >
              MDN Web Docs: atob()
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

export default Base64decode;

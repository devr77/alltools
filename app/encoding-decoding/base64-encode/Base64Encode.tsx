"use client";
import React, { useState } from "react";

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
      <textarea
        rows={5}
        cols={50}
        placeholder="Enter text to encode"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
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
      <textarea
        rows={5}
        cols={50}
        placeholder="Base64 output"
        value={output}
        readOnly
        style={{ marginTop: "8px" }}
      />
    </div>
  );
}

export default Base64Encode;

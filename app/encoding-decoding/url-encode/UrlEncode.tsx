"use client";
import React, { useState } from "react";

function UrlEncode() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const encoded = encodeURIComponent(input);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(encoded);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>
        URL Encoder – Encode Text for Safe URLs
      </h1>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text to encode"
        rows={4}
        style={{
          width: "100%",
          marginBottom: 16,
          fontSize: 16,
          border: "2px solid #1976d2",
          borderRadius: 6,
          outline: "none",
          padding: 10,
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
      />
      <h2 style={{ fontSize: 20, margin: "16px 0 8px 0" }}>Encoded Output</h2>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#f5f5f5",
          borderRadius: 4,
          padding: "8px 12px",
          marginBottom: 16,
          wordBreak: "break-all",
        }}
      >
        <span style={{ flex: 1 }}>{encoded}</span>
        <button
          onClick={handleCopy}
          style={{
            marginLeft: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Copy encoded text"
          title="Copy"
        >
          {/* Simple copy icon (SVG) */}
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            style={{ marginRight: copied ? 4 : 0 }}
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
          {copied && (
            <span style={{ color: "green", fontSize: 14 }}>Copied!</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default UrlEncode;

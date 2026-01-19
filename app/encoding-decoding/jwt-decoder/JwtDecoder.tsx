"use client";
import React, { useState } from "react";

function JwtDecoder() {
  const [input, setInput] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const decodeBase64Url = (str: string) => {
    try {
      // Pad string for atob
      str = str.replace(/-/g, "+").replace(/_/g, "/");
      while (str.length % 4) str += "=";
      return decodeURIComponent(
        atob(str)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
    } catch {
      return "";
    }
  };

  const handleDecode = () => {
    setError("");
    setHeader("");
    setPayload("");
    if (!input.trim()) return;
    const parts = input.trim().split(".");
    if (parts.length < 2) {
      setError("Invalid JWT: must have at least header and payload.");
      return;
    }
    try {
      const decodedHeader = decodeBase64Url(parts[0]);
      const decodedPayload = decodeBase64Url(parts[1]);
      setHeader(JSON.stringify(JSON.parse(decodedHeader), null, 2));
      setPayload(JSON.stringify(JSON.parse(decodedPayload), null, 2));
    } catch {
      setError("Failed to decode JWT. Ensure it is a valid JWT string.");
    }
  };

  const handleCopy = async () => {
    if (!header && !payload) return;
    await navigator.clipboard.writeText(
      `Header:\n${header}\n\nPayload:\n${payload}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleClear = () => {
    setInput("");
    setHeader("");
    setPayload("");
    setError("");
    setCopied(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
        JWT Decoder
      </h1>
      <textarea
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your JWT here..."
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
          onClick={handleDecode}
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
          Decode
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
      {error && (
        <div style={{ color: "#e11d48", marginBottom: 12 }}>{error}</div>
      )}
      {(header || payload) && (
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 500 }}>Header:</label>
          <textarea
            rows={6}
            value={header}
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
          <label style={{ fontWeight: 500 }}>Payload:</label>
          <textarea
            rows={10}
            value={payload}
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
              style={{
                border: "2px solid #0070f3",
                background: copied ? "#0070f3" : "#fff",
                color: copied ? "#fff" : "#0070f3",
                padding: "8px 16px",
                borderRadius: 5,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default JwtDecoder;

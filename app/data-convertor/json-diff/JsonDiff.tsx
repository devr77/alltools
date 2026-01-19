"use client";
import React, { useState, useRef } from "react";
import { diffString } from "json-diff";

function JsonDiff() {
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  const handleDiff = () => {
    setError("");
    setOutput("");
    try {
      const jsonA = JSON.parse(inputA);
      const jsonB = JSON.parse(inputB);
      const result = diffString(jsonA, jsonB);
      setOutput(result || "No differences found.");
    } catch (e: any) {
      setError("Invalid JSON: " + e.message);
    }
  };

  const handleFileUploadA = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setInputA(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleFileUploadB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setInputB(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
        JSON Diff Tool
      </h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 600 }}>JSON A</label>
          <textarea
            rows={8}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: 15,
              marginBottom: 8,
            }}
            placeholder="Paste first JSON here"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
          />
          <button
            type="button"
            onClick={() => fileInputARef.current?.click()}
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
              marginBottom: 8,
            }}
            title="Upload JSON A file"
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
            Upload JSON A
          </button>
          <input
            ref={fileInputARef}
            type="file"
            accept=".json,application/json"
            style={{ display: "none" }}
            onChange={handleFileUploadA}
            aria-label="Upload JSON A file"
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 600 }}>JSON B</label>
          <textarea
            rows={8}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: 15,
              marginBottom: 8,
            }}
            placeholder="Paste second JSON here"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
          />
          <button
            type="button"
            onClick={() => fileInputBRef.current?.click()}
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
              marginBottom: 8,
            }}
            title="Upload JSON B file"
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
            Upload JSON B
          </button>
          <input
            ref={fileInputBRef}
            type="file"
            accept=".json,application/json"
            style={{ display: "none" }}
            onChange={handleFileUploadB}
            aria-label="Upload JSON B file"
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={handleDiff}
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
          Compare
        </button>
      </div>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {output && (
        <pre
          style={{
            background: "#f4f4f4",
            padding: 12,
            borderRadius: 4,
            fontFamily: "monospace",
            fontSize: 15,
            whiteSpace: "pre-wrap",
            marginBottom: 8,
          }}
        >
          {output}
        </pre>
      )}
    </main>
  );
}

export default JsonDiff;

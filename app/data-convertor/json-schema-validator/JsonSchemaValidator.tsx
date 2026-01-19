"use client";
import React, { useState } from "react";
import Ajv from "ajv";

function JsonSchemaValidator() {
  const [jsonInput, setJsonInput] = useState("");
  const [schemaInput, setSchemaInput] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleValidate = () => {
    setError("");
    setResult("");
    try {
      const data = JSON.parse(jsonInput);
      const schema = JSON.parse(schemaInput);
      const ajv = new Ajv();
      const validate = ajv.compile(schema);
      const valid = validate(data);
      if (valid) {
        setResult("✅ JSON is valid against the schema.");
      } else {
        setResult(
          "❌ Validation errors:\n" +
            (validate.errors
              ? validate.errors
                  .map((e) => `- ${e.instancePath || "/"}: ${e.message}`)
                  .join("\n")
              : "Unknown error"),
        );
      }
    } catch (e: any) {
      setError("Invalid JSON or Schema: " + e.message);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
        JSON Schema Validator
      </h2>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600 }}>JSON Input</label>
        <textarea
          rows={6}
          style={{
            width: "100%",
            fontFamily: "monospace",
            fontSize: 15,
            marginBottom: 8,
          }}
          placeholder="Paste your JSON here"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600 }}>JSON Schema</label>
        <textarea
          rows={6}
          style={{
            width: "100%",
            fontFamily: "monospace",
            fontSize: 15,
            marginBottom: 8,
          }}
          placeholder="Paste your JSON Schema here"
          value={schemaInput}
          onChange={(e) => setSchemaInput(e.target.value)}
        />
      </div>
      <button
        onClick={handleValidate}
        style={{
          background: "#0070f3",
          color: "#fff",
          padding: "8px 18px",
          borderRadius: 4,
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        Validate
      </button>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {result && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handleCopy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: copied ? "#0070f3" : "#eaeaea",
                color: copied ? "#fff" : "#333",
                padding: "6px 12px",
                borderRadius: 4,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                marginBottom: 8,
              }}
              title="Copy validation result"
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
          </div>
          <pre
            style={{
              background: "#f4f4f4",
              padding: 12,
              borderRadius: 4,
              fontFamily: "monospace",
              fontSize: 15,
              whiteSpace: "pre-wrap",
              marginBottom: 0,
            }}
          >
            {result}
          </pre>
        </div>
      )}
    </main>
  );
}

export default JsonSchemaValidator;

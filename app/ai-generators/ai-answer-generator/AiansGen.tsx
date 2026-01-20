"use client";
import React, { useState } from "react";

function AiansGen() {
  const [question, setQuestion] = useState("");
  const [output, setOutput] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const SYSTEM_PROMPT =
    "You are an expert assistant. Given a question or context, provide a clear, concise, and accurate answer. Return only the answer.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setOutput("");
    setError("");
    try {
      const res = await fetch("/api/ai-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterprompt: SYSTEM_PROMPT, prompt: question }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate answer");
      } else {
        setOutput(data.content);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setPending(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
        AI Answer Generator
      </h1>
      <label style={{ fontWeight: 500 }}>Question or Context:</label>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={4}
        placeholder="Enter your question or context..."
        style={{
          width: "100%",
          fontFamily: "monospace",
          border: "1px solid #d1d5db",
          borderRadius: 5,
          padding: 8,
          marginBottom: 12,
        }}
        required
        disabled={pending}
      />
      <div style={{ marginBottom: 12 }}>
        <button
          type="submit"
          disabled={pending || !question}
          style={{
            border: "2px solid #0070f3",
            background: "#fff",
            color: "#0070f3",
            padding: "8px 16px",
            borderRadius: 5,
            fontWeight: 500,
            cursor: pending || !question ? "not-allowed" : "pointer",
          }}
        >
          {pending ? "Generating..." : "Generate Answer"}
        </button>
      </div>
      {error && (
        <div style={{ color: "#e11d48", marginBottom: 8 }}>{error}</div>
      )}
      {output && (
        <div>
          <label style={{ fontWeight: 500 }}>AI Answer:</label>
          <textarea
            value={output}
            readOnly
            rows={8}
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
          <button
            type="button"
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
      )}
    </form>
  );
          padding: 8,
          marginBottom: 12,
        }}
        required
        disabled={pending}
      />
      <div style={{ marginBottom: 12 }}>
        <button
          type="submit"
          disabled={pending || !question}
          style={{
            border: "2px solid #0070f3",
            background: "#fff",
            color: "#0070f3",
            padding: "8px 16px",
            borderRadius: 5,
            fontWeight: 500,
            cursor: pending || !question ? "not-allowed" : "pointer",
          }}
        >
          {pending ? "Generating..." : "Generate Answer"}
        </button>
      </div>
      {error && (
        <div style={{ color: "#e11d48", marginBottom: 8 }}>{error}</div>
      )}
      {output && (
        <div>
          <label style={{ fontWeight: 500 }}>AI Answer:</label>
          <textarea
            value={output}
            readOnly
            rows={5}
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
          <button
            type="button"
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
      )}
    </form>
  );
}

export default AiansGen;

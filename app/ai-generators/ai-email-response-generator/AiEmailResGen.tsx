"use client";
import React, { useState } from "react";
import FAQSection from "../../components/FAQSection";
import { aiGeneratorFAQs } from "../../components/faqData";

function AiEmailResGen() {
  const [email, setEmail] = useState("");
  const [output, setOutput] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const SYSTEM_PROMPT =
    "You are an expert email assistant. Given the email content or context, generate a clear, concise, and polite email response. Return only the response email.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setOutput("");
    setError("");
    try {
      const res = await fetch("/api/ai-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterprompt: SYSTEM_PROMPT, prompt: email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate email response");
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
        AI Email Response Generator
      </h1>
      <p style={{ marginBottom: 20, lineHeight: 1.6, color: "#666" }}>
        The AI Email Response Generator transforms email communication by creating personalized, professional responses that maintain human-like warmth and attention to detail. This intelligent email assistant analyzes incoming messages, understands context and tone, and generates appropriate replies that reflect the sender's communication style and relationship dynamics.
      </p>
      <label style={{ fontWeight: 500 }}>Email Content or Context:</label>
      <textarea
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        rows={6}
        placeholder="Paste the email or describe the context for your response..."
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
          disabled={pending || !email}
          style={{
            border: "2px solid #0070f3",
            background: "#fff",
            color: "#0070f3",
            padding: "8px 16px",
            borderRadius: 5,
            fontWeight: 500,
            cursor: pending || !email ? "not-allowed" : "pointer",
          }}
        >
          {pending ? "Generating..." : "Generate Response"}
        </button>
      </div>
      {error && (
        <div style={{ color: "#e11d48", marginBottom: 8 }}>{error}</div>
      )}
      {output && (
        <div>
          <label style={{ fontWeight: 500 }}>AI Email Response:</label>
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
      <FAQSection faqs={aiGeneratorFAQs} />
    </form>
  );
}

export default AiEmailResGen;

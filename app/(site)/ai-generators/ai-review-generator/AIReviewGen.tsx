"use client";
import React, { useState } from "react";
import FAQSection from "@/app/components/FAQSection";
import { aiGeneratorFAQs } from "@/app/components/faqData";

function AIReviewGen() {
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const SYSTEM_PROMPT =
    "You are an expert review writer. Given a product, service, or context, generate a clear, concise, and honest review. Return only the review text.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setOutput("");
    setError("");
    try {
      const res = await fetch("/api/ai-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterprompt: SYSTEM_PROMPT, prompt: context }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate review");
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
        AI Review Generator
      </h1>
      <p style={{ marginBottom: 20, lineHeight: 1.6, color: "#666" }}>
        The AI Review Generator is a cutting-edge artificial intelligence-powered tool designed to create authentic, engaging product and service reviews that resonate with modern consumers. This innovative review generation tool leverages advanced natural language processing algorithms to produce high-quality, contextually relevant reviews that can enhance your online reputation and boost customer trust.
      </p>
      <label style={{ fontWeight: 500 }}>Product, Service, or Context:</label>
      <textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        rows={4}
        placeholder="Describe the product, service, or context for your review..."
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
          disabled={pending || !context}
          style={{
            border: "2px solid #0070f3",
            background: "#fff",
            color: "#0070f3",
            padding: "8px 16px",
            borderRadius: 5,
            fontWeight: 500,
            cursor: pending || !context ? "not-allowed" : "pointer",
          }}
        >
          {pending ? "Generating..." : "Generate Review"}
        </button>
      </div>
      {error && (
        <div style={{ color: "#e11d48", marginBottom: 8 }}>{error}</div>
      )}
      {output && (
        <div>
          <label style={{ fontWeight: 500 }}>AI Review:</label>
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

export default AIReviewGen;

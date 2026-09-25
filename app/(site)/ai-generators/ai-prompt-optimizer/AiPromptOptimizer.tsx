"use client";
import React, { useState } from "react";
import FAQSection from "@/app/components/FAQSection";
import { aiGeneratorFAQs } from "@/app/components/faqData";

function AiPromptOptimizer() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const SYSTEM_PROMPT =
    "You are an expert prompt engineer. Optimize the following prompt for clarity, specificity, and effectiveness for an AI model. Return only the improved prompt.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setOutput("");
    setError("");
    try {
      const res = await fetch("/api/ai-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterprompt: SYSTEM_PROMPT, prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to optimize prompt");
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
        AI Prompt Optimizer
      </h1>
      <p style={{ marginBottom: 20, lineHeight: 1.6, color: "#666" }}>
        The AI Prompt Optimizer takes prompt engineering to the next level by analyzing and refining existing prompts to achieve superior AI model performance. This advanced optimization tool uses machine learning algorithms to identify weaknesses in prompts and suggest improvements that enhance clarity, specificity, and effectiveness.
      </p>
      <label style={{ fontWeight: 500 }}>Your Prompt:</label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        placeholder="Paste your prompt to optimize..."
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
          disabled={pending || !prompt}
          style={{
            border: "2px solid #0070f3",
            background: "#fff",
            color: "#0070f3",
            padding: "8px 16px",
            borderRadius: 5,
            fontWeight: 500,
            cursor: pending || !prompt ? "not-allowed" : "pointer",
          }}
        >
          {pending ? "Optimizing..." : "Optimize"}
        </button>
      </div>
      {error && (
        <div style={{ color: "#e11d48", marginBottom: 8 }}>{error}</div>
      )}
      {output && (
        <div>
          <label style={{ fontWeight: 500 }}>Optimized Prompt:</label>
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
      <FAQSection faqs={aiGeneratorFAQs} />
    </form>
  );
}

export default AiPromptOptimizer;

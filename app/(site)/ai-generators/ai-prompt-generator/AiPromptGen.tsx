"use client";
import React, { useState } from "react";
import FAQSection from "@/app/components/FAQSection";
import { aiGeneratorFAQs } from "@/app/components/faqData";

const SYSTEM_PROMPT_OPTIONS = [
  {
    label: "Default (Helpful Assistant)",
    value:
      "You are a helpful assistant that provides concise and accurate information.",
  },
  {
    label: "Creative Assistant",
    value:
      "You are a creative assistant who helps brainstorm ideas and solutions.",
  },
  {
    label: "Technical Expert",
    value: "You are a technical expert who explains complex topics simply.",
  },
  {
    label: "Friendly Conversationalist",
    value:
      "You are a friendly assistant who responds in a warm, conversational tone.",
  },
  {
    label: "Custom",
    value: "__custom__",
  },
];

function AiPromptGen() {
  const [systemPromptType, setSystemPromptType] = useState(
    SYSTEM_PROMPT_OPTIONS[0].value,
  );
  const [customSystemPrompt, setCustomSystemPrompt] = useState("");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const getSystemPrompt = () =>
    systemPromptType === "__custom__" ? customSystemPrompt : systemPromptType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setOutput("");
    setError("");
    try {
      // Simulate async operation
      await new Promise((res) => setTimeout(res, 800));
      setOutput(
        `System: ${getSystemPrompt()}\nPrompt: ${prompt}\n\n[Generated prompt goes here...]`,
      );
    } catch (err) {
      setError("Failed to generate prompt.");
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
        AI Prompt Generator
      </h1>
      <p style={{ marginBottom: 20, lineHeight: 1.6, color: "#666" }}>
        The AI Prompt Generator is a revolutionary tool that transforms how users interact with artificial intelligence language models. This intelligent prompt creation tool analyzes user objectives, context, and desired outcomes to craft highly effective prompts that maximize AI response quality and relevance.
      </p>
      <label style={{ fontWeight: 500 }}>System Prompt (optional):</label>
      <select
        value={systemPromptType}
        onChange={(e) => setSystemPromptType(e.target.value)}
        disabled={pending}
        style={{
          width: "100%",
          fontFamily: "monospace",
          border: "1px solid #d1d5db",
          borderRadius: 5,
          padding: 8,
          marginBottom: 8,
        }}
      >
        {SYSTEM_PROMPT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {systemPromptType === "__custom__" && (
        <textarea
          value={customSystemPrompt}
          onChange={(e) => setCustomSystemPrompt(e.target.value)}
          rows={2}
          placeholder="Enter your custom system prompt..."
          style={{
            width: "100%",
            fontFamily: "monospace",
            border: "1px solid #d1d5db",
            borderRadius: 5,
            padding: 8,
            marginBottom: 12,
          }}
          disabled={pending}
        />
      )}
      <label style={{ fontWeight: 500 }}>Your Prompt:</label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        placeholder="Describe what you want the AI to generate..."
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
          {pending ? "Generating..." : "Generate"}
        </button>
      </div>
      {error && (
        <div style={{ color: "#e11d48", marginBottom: 8 }}>{error}</div>
      )}
      {output && (
        <div>
          <label style={{ fontWeight: 500 }}>AI Output:</label>
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

export default AiPromptGen;

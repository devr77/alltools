"use client";
import React, { useState } from "react";
import FAQSection from "../../components/FAQSection";
import { aiGeneratorFAQs } from "../../components/faqData";

function AireplyGen() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setReply("");
    setError("");
    try {
      const res = await fetch("/api/ai-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          masterprompt:
            "You are a helpful AI assistant that generates concise, polite, and context-aware replies.",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate reply");
      } else {
        setReply(data.content);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setPending(false);
    }
  };

  const handleCopy = async () => {
    if (!reply) return;
    await navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
        AI Reply Generator
      </h1>
      <p style={{ marginBottom: 20, lineHeight: 1.6, color: "#666" }}>
        The AI Reply Generator represents the future of digital communication, offering intelligent automated responses that maintain the personal touch in an increasingly fast-paced world. This sophisticated AI-powered tool analyzes conversation context, tone, and intent to generate appropriate, contextually relevant replies across various communication channels.
      </p>
      <label style={{ fontWeight: 500 }}>Message or Context:</label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={5}
        placeholder="Paste the message or context you want a reply for..."
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
          {pending ? "Generating..." : "Generate Reply"}
        </button>
      </div>
      {error && (
        <div style={{ color: "#e11d48", marginBottom: 8 }}>{error}</div>
      )}
      {reply && (
        <div>
          <label style={{ fontWeight: 500 }}>AI Reply:</label>
          <textarea
            value={reply}
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
            disabled={!reply}
            style={{
              border: "2px solid #0070f3",
              background: copied ? "#0070f3" : "#fff",
              color: copied ? "#fff" : "#0070f3",
              padding: "8px 16px",
              borderRadius: 5,
              fontWeight: 500,
              cursor: reply ? "pointer" : "not-allowed",
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

export default AireplyGen;

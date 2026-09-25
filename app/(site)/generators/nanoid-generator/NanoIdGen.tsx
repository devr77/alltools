"use client";
import React, { useState } from "react";
import { nanoid } from "nanoid";
import FAQSection from "@/app/components/FAQSection";
import { generatorFAQs } from "@/app/components/faqData";

function NanoIdGen() {
  const [id, setId] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setId(nanoid());
    setCopied(false);
  };

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission if inside a form
    if (id) {
      try {
        await navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } catch {
        setCopied(false);
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", textAlign: "center" }}>
      {/* Visually hidden h1 for SEO */}
      <h1
        style={{
          position: "absolute",
          left: "-10000px",
          top: "auto",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        NanoID Generator Online - Secure Unique ID Generator
      </h1>
      {/* Visible title styled as h2 but not a header tag */}
      <div
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
          letterSpacing: "0.01em",
        }}
      >
        NanoID Generator
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={id}
          readOnly
          style={{ width: "80%", fontSize: "1.1rem", padding: "0.5rem" }}
          placeholder="Click Generate to create NanoID"
        />
      </div>
      <button
        onClick={handleGenerate}
        style={{
          marginRight: 8,
          border: "2px solid #0070f3",
          background: "white",
          color: "#0070f3",
          padding: "0.5rem 1.2rem",
          borderRadius: 4,
          fontWeight: 500,
          cursor: "pointer",
          outline: "none",
        }}
      >
        Generate
      </button>
      <button
        onClick={handleCopy}
        disabled={!id}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "0.5rem 1.2rem",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: "#f5f5f5",
          color: "#333",
          fontWeight: 500,
          cursor: id ? "pointer" : "not-allowed",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
          style={{ marginRight: 4 }}
        >
          <rect
            x="9"
            y="9"
            width="13"
            height="13"
            rx="2"
            stroke="#333"
            strokeWidth="2"
          />
          <rect
            x="3"
            y="3"
            width="13"
            height="13"
            rx="2"
            stroke="#333"
            strokeWidth="2"
          />
        </svg>
        {copied ? "Copied!" : "Copy"}
      </button>
      <FAQSection faqs={generatorFAQs} />
    </div>
  );
}

export default NanoIdGen;

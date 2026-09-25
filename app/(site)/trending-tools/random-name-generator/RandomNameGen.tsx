"use client";
import React, { useState } from "react";
import { faker } from "@faker-js/faker";
import FAQSection from "@/app/components/FAQSection";
import { trendingToolsFAQs } from "@/app/components/faqData";

function getRandomName() {
  return faker.person.fullName();
}

function RandomNameGen() {
  const [name, setName] = useState(getRandomName());
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setName(getRandomName());
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 320,
        margin: "2rem auto",
        textAlign: "center",
      }}
    >
      <h1>Random Name Generator</h1>
      <div
        style={{
          fontSize: "1.5rem",
          margin: "1rem 0",
          padding: "0.5rem",
          border: "1px solid #ccc",
          borderRadius: 8,
          background: "#f9f9f9",
        }}
      >
        {name}
      </div>
      <button
        onClick={handleGenerate}
        style={{
          marginRight: 8,
          border: "2px solid #0070f3",
          background: "white",
          color: "#0070f3",
          borderRadius: 6,
          padding: "0.4rem 1rem",
          fontWeight: 500,
          cursor: "pointer",
          outline: "none",
        }}
      >
        Generate
      </button>
      <button
        onClick={handleCopy}
        style={{
          border: "none",
          background: "#0070f3",
          color: "white",
          borderRadius: 6,
          padding: "0.4rem 1rem",
          fontWeight: 500,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
          style={{ verticalAlign: "middle" }}
        >
          <rect
            x="9"
            y="9"
            width="13"
            height="13"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect
            x="3"
            y="3"
            width="13"
            height="13"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.5"
          />
        </svg>
        {copied ? "Copied!" : "Copy"}
      </button>
      <FAQSection faqs={trendingToolsFAQs} />
    </div>
  );
}

export default RandomNameGen;

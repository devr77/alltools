"use client";
import React, { useState } from "react";
import { faker } from "@faker-js/faker";
import FAQSection from "@/app/components/FAQSection";
import { trendingToolsFAQs } from "@/app/components/faqData";

function getRandomLastName() {
  return faker.person.lastName();
}

function LastNameGen() {
  const [lastName, setLastName] = useState<string>("");

  const handleGenerate = () => {
    setLastName(getRandomLastName());
  };

  const handleCopy = async () => {
    if (lastName) {
      await navigator.clipboard.writeText(lastName);
    }
  };

  return (
    <>
      <main>
        <h1>Random Last Name Generator</h1>
        <h2>Generate a random last name for any purpose</h2>
        {lastName && (
          <div
            style={{
              margin: "1.5rem auto 1rem auto",
              fontWeight: "bold",
              fontSize: "2rem",
              maxWidth: 400,
              border: "2px solid #0070f3",
              borderRadius: "10px",
              background: "#f9f9f9",
              color: "#222",
              padding: "1rem",
              wordBreak: "break-word",
              boxSizing: "border-box",
              textAlign: "center",
              width: "90vw",
              minWidth: 0,
            }}
          >
            {lastName}
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
            alignItems: "center",
            marginTop: lastName ? 0 : "2rem",
          }}
        >
          <button
            onClick={handleGenerate}
            style={{
              border: "2px solid #0070f3",
              background: "white",
              color: "#0070f3",
              padding: "0.5rem 1.2rem",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: 500,
              minWidth: 160,
            }}
          >
            Generate Last Name
          </button>
          {lastName && (
            <button
              onClick={handleCopy}
              title="Copy to clipboard"
              style={{
                border: "2px solid #888",
                background: "#f9f9f9",
                color: "#333",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4em",
                minWidth: 100,
              }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
                <rect
                  x="6"
                  y="6"
                  width="9"
                  height="12"
                  rx="2"
                  stroke="#333"
                  strokeWidth="1.5"
                  fill="none"
                />
                <rect
                  x="3"
                  y="2"
                  width="9"
                  height="12"
                  rx="2"
                  stroke="#333"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
              Copy
            </button>
          )}
        </div>
      </main>
      <FAQSection faqs={trendingToolsFAQs} />
    </>
  );
}

export default LastNameGen;

"use client";
import React, { useState } from "react";
import FAQSection from "../../components/FAQSection";
import { trendingToolsFAQs } from "../../components/faqData";

function RandomNumGen() {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(10);
  const [choices, setChoices] = useState<string[]>(
    Array.from({ length: 10 }, (_, i) => (i + 1).toString()),
  );
  const [picked, setPicked] = useState<string | null>(null);

  const sanitize = (val: number) => (isNaN(val) || val < 0 ? 0 : val);

  const updateChoices = (newMin: number, newMax: number) => {
    const start = Math.min(newMin, newMax);
    const end = Math.max(newMin, newMax);
    setChoices(
      Array.from({ length: end - start + 1 }, (_, i) => (start + i).toString()),
    );
    setPicked(null);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = sanitize(Number(e.target.value));
    if (val > max) val = max;
    setMin(val);
    updateChoices(val, max);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = sanitize(Number(e.target.value));
    if (val < min) val = min;
    setMax(val);
    updateChoices(min, val);
  };

  const handlePick = () => {
    if (choices.length > 0) {
      const idx = Math.floor(Math.random() * choices.length);
      setPicked(choices[idx]);
    }
  };

  return (
    <main
      style={{
        maxWidth: 420,
        margin: "2rem auto",
        padding: "1rem",
        width: "95vw",
      }}
    >
      <h1 style={{ fontSize: "1.6rem", textAlign: "center" }}>
        Random Number Generator
      </h1>
      <h2
        style={{
          fontSize: "1.1rem",
          textAlign: "center",
          fontWeight: 400,
          marginBottom: "2rem",
        }}
      >
        Pick a random number from {min} to {max}
      </h2>
      <h2
        style={{
          fontSize: "1.05rem",
          fontWeight: 500,
          margin: "1.5rem 0 0.5rem 0",
        }}
      >
        Controls
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <label>
            Min:
            <input
              type="number"
              value={min}
              min={0}
              max={max}
              onChange={handleMinChange}
              style={{
                width: 60,
                marginLeft: 6,
                padding: "0.4rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                textAlign: "center",
              }}
            />
          </label>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <label>
            Max:
            <input
              type="number"
              value={max}
              min={min}
              onChange={handleMaxChange}
              style={{
                width: 60,
                marginLeft: 6,
                padding: "0.4rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                textAlign: "center",
              }}
            />
          </label>
        </div>
      </div>
      <button
        onClick={handlePick}
        disabled={choices.length === 0}
        style={{
          border: "2px solid #0070f3",
          background: choices.length === 0 ? "#eee" : "white",
          color: "#0070f3",
          padding: "0.5rem 1.2rem",
          borderRadius: "5px",
          cursor: choices.length === 0 ? "not-allowed" : "pointer",
          fontWeight: 500,
          minWidth: 160,
          marginBottom: "1.5rem",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Pick Random Choice
      </button>
      {picked && (
        <>
          <h2
            style={{
              fontSize: "1.05rem",
              fontWeight: 500,
              margin: "2rem 0 0.5rem 0",
              textAlign: "center",
            }}
          >
            Result
          </h2>
          <div
            style={{
              margin: "1.5rem auto 0 auto",
              fontWeight: "bold",
              fontSize: "1.5rem",
              border: "2px solid #0070f3",
              borderRadius: "10px",
              background: "#f9f9f9",
              color: "#222",
              padding: "1rem",
              wordBreak: "break-word",
              textAlign: "center",
              maxWidth: 400,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {picked}
          </div>
        </>
      )}
      <FAQSection faqs={trendingToolsFAQs} />
    </main>
  );
}

export default RandomNumGen;

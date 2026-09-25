"use client";
import React, { useState } from "react";
import { faker } from "@faker-js/faker";
import FAQSection from "@/app/components/FAQSection";
import { trendingToolsFAQs } from "@/app/components/faqData";

function LoremPicsumGen() {
  const [paragraphs, setParagraphs] = useState(1);
  const [words, setWords] = useState(20);
  const [output, setOutput] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const paras = Array.from({ length: paragraphs }, () =>
      faker.lorem.words(words),
    );
    setOutput(paras);
  };

  const handleCopy = async () => {
    const text = output.join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <h1>Lorem Ipsum Generator</h1>
      <h2 style={{ fontSize: 20, margin: "20px 0 8px 0" }}>
        Generator Controls
      </h2>
      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}
      >
        <label>
          Paragraphs:&nbsp;
          <input
            type="number"
            min={1}
            max={20}
            value={paragraphs}
            onChange={(e) => setParagraphs(Number(e.target.value))}
            style={{
              width: 60,
              outline: "2px solid transparent",
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: "4px 8px",
              fontSize: 16,
              transition: "outline 0.2s",
            }}
            aria-label="Number of paragraphs"
            onFocus={(e) =>
              (e.currentTarget.style.outline = "2px solid #0070f3")
            }
            onBlur={(e) =>
              (e.currentTarget.style.outline = "2px solid transparent")
            }
          />
        </label>
        <label>
          Words/Paragraph:&nbsp;
          <input
            type="number"
            min={5}
            max={200}
            value={words}
            onChange={(e) => setWords(Number(e.target.value))}
            style={{
              width: 60,
              outline: "2px solid transparent",
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: "4px 8px",
              fontSize: 16,
              transition: "outline 0.2s",
            }}
            aria-label="Words per paragraph"
            onFocus={(e) =>
              (e.currentTarget.style.outline = "2px solid #0070f3")
            }
            onBlur={(e) =>
              (e.currentTarget.style.outline = "2px solid transparent")
            }
          />
        </label>
        <button
          onClick={generate}
          style={{
            outline: "2px solid transparent",
            outlineOffset: 2,
            border: "1px solid #0070f3",
            background: "#0070f3",
            color: "#fff",
            borderRadius: 4,
            padding: "8px 16px",
            fontSize: 16,
            cursor: "pointer",
            transition: "outline 0.2s, background 0.2s",
          }}
          tabIndex={0}
          aria-label="Generate lorem ipsum"
          onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0070f3")}
          onBlur={(e) =>
            (e.currentTarget.style.outline = "2px solid transparent")
          }
          onMouseOver={(e) => (e.currentTarget.style.background = "#005bb5")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#0070f3")}
        >
          Generate
        </button>
        <button
          onClick={handleCopy}
          disabled={output.length === 0}
          style={{
            outline: "2px solid transparent",
            outlineOffset: 2,
            border: "1px solid #0070f3",
            background: "#fff",
            color: "#0070f3",
            borderRadius: 4,
            padding: "8px 16px",
            fontSize: 16,
            cursor: output.length === 0 ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "outline 0.2s, background 0.2s",
          }}
          tabIndex={0}
          aria-label="Copy generated text"
          onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0070f3")}
          onBlur={(e) =>
            (e.currentTarget.style.outline = "2px solid transparent")
          }
          onMouseOver={(e) => (e.currentTarget.style.background = "#e6f0fa")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            style={{ display: "inline", verticalAlign: "middle" }}
          >
            <rect
              x="9"
              y="9"
              width="13"
              height="13"
              rx="2"
              stroke="#0070f3"
              strokeWidth="2"
              fill="none"
            />
            <rect
              x="3"
              y="3"
              width="13"
              height="13"
              rx="2"
              stroke="#0070f3"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <h2 style={{ fontSize: 20, margin: "20px 0 8px 0" }}>
        Generated Lorem Ipsum
      </h2>
      <div style={{ marginTop: 16 }}>
        {output.map((para, idx) => (
          <p key={idx} style={{ lineHeight: 1.6 }}>
            {para}
          </p>
        ))}
      </div>
      <FAQSection faqs={trendingToolsFAQs} />
    </div>
  );
}

export default LoremPicsumGen;

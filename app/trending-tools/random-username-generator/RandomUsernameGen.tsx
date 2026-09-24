"use client";
import React, { useState } from "react";
import { faker } from "@faker-js/faker";
import FAQSection from "../../components/FAQSection";
import { trendingToolsFAQs } from "../../components/faqData";

function generateUsername(extra: string, length: number, addNum: boolean) {
  let username = faker.internet.userName();
  if (extra.trim()) {
    username = `${extra.trim()}${username}`;
  }
  let numStr = "";
  if (addNum) {
    numStr = Math.floor(Math.random() * 1000).toString();
    username += numStr;
  }
  if (length > 0) {
    // If addNum is checked, ensure at least part of the number is included at the end
    if (addNum && length < username.length) {
      // Always keep as much of numStr at the end as possible
      const keepNum = Math.min(numStr.length, length);
      const keepName = length - keepNum;
      username =
        username.slice(0, keepName) + numStr.slice(numStr.length - keepNum);
    } else {
      username = username.slice(0, length);
    }
  }
  return username;
}

function RandomUsernameGen() {
  const [extra, setExtra] = useState("");
  const [username, setUsername] = useState("");
  const [length, setLength] = useState<number>(8);
  const [addNum, setAddNum] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = () => {
    setUsername(generateUsername(extra, length, addNum));
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(username);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      // fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = username;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      } catch {}
      document.body.removeChild(textarea);
    }
  };

  return (
    <main
      style={{
        maxWidth: 420,
        margin: "2rem auto",
        padding: "1rem",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <h1 style={{ fontSize: "1.6rem", textAlign: "center" }}>
        Random Username Generator
      </h1>
      <h2
        style={{
          fontSize: "1.1rem",
          textAlign: "center",
          fontWeight: 400,
          marginBottom: "2rem",
        }}
      >
        Generate a unique username (optionally add your name or words)
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
          marginBottom: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.7rem",
        }}
      >
        <input
          type="text"
          placeholder="Add name or words (optional)"
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
            minWidth: 0,
            width: "100%",
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <label style={{ minWidth: 110 }}>
            Length: {length > 0 ? length : "Full"}
          </label>
          <input
            type="range"
            min={0}
            max={24}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            style={{ flex: 1, minWidth: 80 }}
          />
          <label
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "auto",
            }}
          >
            <input
              type="checkbox"
              checked={addNum}
              onChange={(e) => setAddNum(e.target.checked)}
              style={{ marginRight: "0.5rem" }}
            />
            Add number
          </label>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "center",
          marginBottom: "1.5rem",
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
            minWidth: 140,
          }}
        >
          Generate Username
        </button>
        {username && (
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
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
      {username && (
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
              margin: "0 auto",
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
            {username}
          </div>
        </>
      )}
      <FAQSection faqs={trendingToolsFAQs} />
    </main>
  );
}

export default RandomUsernameGen;

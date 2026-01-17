"use client";
import React, { useState } from "react";

// Simple UUID v4 generator
function generateUUID() {
  // https://stackoverflow.com/a/2117523
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function UuidGen() {
  const [uuid, setUuid] = useState<string>(generateUUID());
  const [length, setLength] = useState<number>(36);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = () => {
    setUuid(generateUUID());
    setCopied(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(uuid.slice(0, length));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (val < 8) val = 8;
    if (val > 36) val = 36;
    setLength(val);
  };

  return (
    <div>
      {/* Visually hidden h1 for SEO */}
      <h1
        style={{
          position: "absolute",
          left: "-10000px",
          top: "auto",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        UUID Generator Online - Free Random UUID v4 Tool
      </h1>
      {/* Visible title, not a header tag */}
      <span
        style={{
          fontSize: "1.5em",
          fontWeight: 600,
          display: "block",
          marginBottom: "0.5em",
        }}
      >
        UUID Generator
      </span>
      <div style={{ marginBottom: "1em" }}>
        <label>
          Length:&nbsp;
          <input
            type="number"
            min={8}
            max={36}
            value={length}
            onChange={handleLengthChange}
            style={{
              width: 60,
              marginRight: 10,
              border: "1px solid #0070f3",
              background: "none",
              color: "#0070f3",
              borderRadius: 4,
              padding: "0.2em 0.5em",
              outline: "none",
            }}
          />
        </label>
        <input
          type="range"
          min={8}
          max={36}
          value={length}
          onChange={handleLengthChange}
          style={{ verticalAlign: "middle" }}
        />
      </div>
      <div>
        <code style={{ fontSize: "1.2em" }}>{uuid.slice(0, length)}</code>
      </div>
      <div style={{ marginTop: "1em", display: "flex", gap: "0.5em" }}>
        <button
          onClick={handleGenerate}
          style={{
            border: "1px solid #0070f3",
            background: "none",
            color: "#0070f3",
            padding: "0.5em 1em",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Generate New UUID
        </button>
        <button
          onClick={handleCopy}
          style={{
            border: "1px solid #888",
            background: copied ? "#e0ffe0" : "none",
            color: "#222",
            padding: "0.5em 1em",
            borderRadius: 4,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5em",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ display: "inline" }}
          >
            <rect
              x="9"
              y="9"
              width="13"
              height="13"
              rx="2"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
            />
            <rect
              x="3"
              y="3"
              width="13"
              height="13"
              rx="2"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
            />
          </svg>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export default UuidGen;

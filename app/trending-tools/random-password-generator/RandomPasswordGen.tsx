"use client";
import React, { useState } from "react";

const CHAR_SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

// Ensure at least one character from each selected set is included
function generatePassword(length, options) {
  let sets = [];
  if (options.lowercase) sets.push(CHAR_SETS.lowercase);
  if (options.uppercase) sets.push(CHAR_SETS.uppercase);
  if (options.numbers) sets.push(CHAR_SETS.numbers);
  if (options.symbols) sets.push(CHAR_SETS.symbols);
  if (sets.length === 0) return "";

  let chars = sets.join("");
  let passwordArr = [];

  // Guarantee at least one char from each selected set
  sets.forEach((set) => {
    passwordArr.push(set.charAt(Math.floor(Math.random() * set.length)));
  });

  // Fill the rest randomly
  for (let i = passwordArr.length; i < length; i++) {
    passwordArr.push(chars.charAt(Math.floor(Math.random() * chars.length)));
  }

  // Shuffle password
  for (let i = passwordArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArr[i], passwordArr[j]] = [passwordArr[j], passwordArr[i]];
  }

  return passwordArr.join("");
}

function RandomPasswordGen() {
  const [length, setLength] = useState(12);
  const [options, setOptions] = useState({
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: false,
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setPassword(generatePassword(length, options));
    setCopied(false);
  };

  const handleOptionChange = (e) => {
    const { name, checked } = e.target;
    setOptions((prev) => ({ ...prev, [name]: checked }));
  };

  const handleCopy = async () => {
    if (password) {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        width: "100%",
        margin: "2rem auto",
        padding: 32,
        border: "1px solid #ccc",
        borderRadius: 12,
        background: "#fff",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ fontSize: "2em", marginBottom: 8 }}>
        Random Password Generator
      </h1>
      <h2 style={{ fontSize: "1.1em", fontWeight: "normal", marginBottom: 20 }}>
        Create secure, random passwords with custom length and character sets.
      </h2>
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontWeight: "bold", marginRight: 8 }}>Length:</label>
        <input
          type="number"
          min={4}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          style={{
            marginLeft: 8,
            width: 60,
            outline: "2px solid #1976d2",
            border: "1px solid #ccc",
            borderRadius: 4,
            padding: "4px 8px",
            fontWeight: "bold",
            background: "#fff",
            marginRight: 16,
          }}
        />
        <input
          type="range"
          min={4}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          style={{
            verticalAlign: "middle",
            width: 220,
            accentColor: "#1976d2",
          }}
        />
        <span style={{ marginLeft: 12, fontWeight: "bold" }}>{length}</span>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 12 }}>
          <input
            type="checkbox"
            name="lowercase"
            checked={options.lowercase}
            onChange={handleOptionChange}
          />{" "}
          Lowercase
        </label>
        <label style={{ marginRight: 12 }}>
          <input
            type="checkbox"
            name="uppercase"
            checked={options.uppercase}
            onChange={handleOptionChange}
          />{" "}
          Uppercase
        </label>
        <label style={{ marginRight: 12 }}>
          <input
            type="checkbox"
            name="numbers"
            checked={options.numbers}
            onChange={handleOptionChange}
          />{" "}
          Numbers
        </label>
        <label>
          <input
            type="checkbox"
            name="symbols"
            checked={options.symbols}
            onChange={handleOptionChange}
          />{" "}
          Symbols
        </label>
      </div>
      <button
        onClick={handleGenerate}
        style={{
          padding: "8px 16px",
          fontWeight: "bold",
          marginRight: 8,
          border: "2px solid #1976d2",
          background: "#fff",
          color: "#1976d2",
          borderRadius: 4,
          outline: "none",
          cursor: "pointer",
        }}
      >
        Generate Password
      </button>
      {password && (
        <button
          onClick={handleCopy}
          style={{
            padding: "8px 16px",
            fontWeight: "bold",
            border: "2px solid #1976d2",
            background: "#fff",
            color: "#1976d2",
            borderRadius: 4,
            outline: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {copied ? (
            "Copied!"
          ) : (
            <>
              {/* Copy Icon SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                style={{ display: "inline", verticalAlign: "middle" }}
              >
                <rect
                  x="7"
                  y="7"
                  width="9"
                  height="11"
                  rx="2"
                  stroke="#1976d2"
                  strokeWidth="1.5"
                  fill="none"
                />
                <rect
                  x="4"
                  y="2"
                  width="9"
                  height="11"
                  rx="2"
                  stroke="#1976d2"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
              Copy
            </>
          )}
        </button>
      )}
      {password && (
        <div style={{ marginTop: 24, wordBreak: "break-all" }}>
          <strong>Password:</strong>
          <div
            style={{
              fontSize: "1.2em",
              marginTop: 8,
              background: "#f5f5f5",
              padding: 8,
              borderRadius: 4,
            }}
          >
            {password}
          </div>
        </div>
      )}
    </div>
  );
}

export default RandomPasswordGen;

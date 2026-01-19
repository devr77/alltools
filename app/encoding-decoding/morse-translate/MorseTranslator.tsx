"use client";
import React, { useState } from "react";

// Morse code map
const morseMap: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  0: "-----",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
  " ": "/",
};
const reverseMorseMap = Object.fromEntries(
  Object.entries(morseMap).map(([k, v]) => [v, k]),
);

function textToMorse(text: string) {
  return text
    .toUpperCase()
    .split("")
    .map((ch) => morseMap[ch] || "")
    .join(" ")
    .replace(/ +/g, " ")
    .trim();
}

function morseToText(morse: string) {
  return morse
    .split(" ")
    .map((code) => reverseMorseMap[code] || "")
    .join("")
    .replace(/\//g, " ");
}

function MorseTranslator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"text-to-morse" | "morse-to-text">(
    "text-to-morse",
  );
  const [copied, setCopied] = useState(false);

  const handleTranslate = () => {
    if (direction === "text-to-morse") {
      setOutput(textToMorse(input));
    } else {
      setOutput(morseToText(input));
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setCopied(false);
  };

  const toggleDirection = () => {
    setDirection((d) =>
      d === "text-to-morse" ? "morse-to-text" : "text-to-morse",
    );
    setInput("");
    setOutput("");
    setCopied(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
        Morse Code Translator
      </h1>
      <button
        onClick={toggleDirection}
        style={{
          marginBottom: 12,
          border: "2px solid #0070f3",
          background: "#fff",
          color: "#0070f3",
          padding: "6px 14px",
          borderRadius: 5,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        {direction === "text-to-morse"
          ? "Switch to Morse → Text"
          : "Switch to Text → Morse"}
      </button>
      <textarea
        rows={5}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          direction === "text-to-morse"
            ? "Enter text to convert to Morse code..."
            : "Enter Morse code (use . and -, separate letters with space, words with /)..."
        }
        style={{
          width: "100%",
          fontFamily: "monospace",
          border: "1px solid #d1d5db",
          borderRadius: 5,
          padding: 8,
          marginBottom: 12,
        }}
      />
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={handleTranslate}
          disabled={!input}
          style={{
            border: "2px solid #0070f3",
            background: "#fff",
            color: "#0070f3",
            padding: "8px 16px",
            borderRadius: 5,
            fontWeight: 500,
            cursor: input ? "pointer" : "not-allowed",
          }}
        >
          Translate
        </button>
        <button
          onClick={handleClear}
          style={{
            border: "2px solid #e11d48",
            background: "#fff",
            color: "#e11d48",
            padding: "8px 16px",
            borderRadius: 5,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>
      <label style={{ fontWeight: 500 }}>
        {direction === "text-to-morse" ? "Morse Code Output:" : "Text Output:"}
      </label>
      <textarea
        rows={5}
        value={output}
        readOnly
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
      <div style={{ display: "flex", gap: 8 }}>
        <button
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
    </div>
  );
}

export default MorseTranslator;

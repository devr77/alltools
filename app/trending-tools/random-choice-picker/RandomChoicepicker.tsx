"use client";
import React, { useState } from "react";

function RandomChoicePicker() {
  const [input, setInput] = useState("");
  const [choices, setChoices] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const handleAddChoice = () => {
    const trimmed = input.trim();
    if (trimmed && !choices.includes(trimmed)) {
      setChoices([...choices, trimmed]);
      setInput("");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddChoice();
  };

  const handlePick = () => {
    if (choices.length > 0) {
      const idx = Math.floor(Math.random() * choices.length);
      setResult(choices[idx]);
    }
  };

  const handleRemove = (choice: string) => {
    setChoices(choices.filter((c) => c !== choice));
    if (result === choice) setResult(null);
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "0 auto",
        padding: 16,
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <h1>Random Choice Picker</h1>
      <h2 style={{ fontSize: 20, margin: "20px 0 8px 0" }}>Enter Choices</h2>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Enter a choice"
          aria-label="Enter a choice"
          style={{
            flex: "1 1 160px",
            minWidth: 0,
            padding: "8px",
            borderRadius: 4,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />
        <button
          onClick={handleAddChoice}
          disabled={!input.trim()}
          style={{
            outline: "2px solid transparent",
            outlineOffset: 2,
            border: "1px solid #0070f3",
            background: "#fff",
            color: "#0070f3",
            borderRadius: 4,
            padding: "8px 16px",
            fontSize: 16,
            cursor: !input.trim() ? "not-allowed" : "pointer",
            transition: "outline 0.2s, background 0.2s",
          }}
          tabIndex={0}
          aria-label="Add choice"
          onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0070f3")}
          onBlur={(e) =>
            (e.currentTarget.style.outline = "2px solid transparent")
          }
          onMouseOver={(e) => (e.currentTarget.style.background = "#e6f0fa")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
        >
          Add
        </button>
      </div>
      <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
        {choices.map((choice) => (
          <li
            key={choice}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
              wordBreak: "break-word",
            }}
          >
            <span>{choice}</span>
            <button
              onClick={() => handleRemove(choice)}
              aria-label={`Remove ${choice}`}
              style={{
                outline: "2px solid transparent",
                outlineOffset: 2,
                border: "1px solid #e00",
                background: "#fff",
                color: "#e00",
                borderRadius: "50%",
                width: 28,
                height: 28,
                fontSize: 18,
                lineHeight: "24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "outline 0.2s, background 0.2s",
              }}
              tabIndex={0}
              onFocus={(e) =>
                (e.currentTarget.style.outline = "2px solid #e00")
              }
              onBlur={(e) =>
                (e.currentTarget.style.outline = "2px solid transparent")
              }
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#ffeaea")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={handlePick}
        disabled={choices.length === 0}
        style={{
          marginTop: 12,
          outline: "2px solid transparent",
          outlineOffset: 2,
          border: "1px solid #0070f3",
          background: "#0070f3",
          color: "#fff",
          borderRadius: 4,
          padding: "10px 20px",
          fontSize: 16,
          cursor: choices.length === 0 ? "not-allowed" : "pointer",
          width: "100%",
          transition: "outline 0.2s, background 0.2s",
        }}
        tabIndex={0}
        aria-label="Pick a random choice"
        onFocus={(e) => (e.currentTarget.style.outline = "2px solid #0070f3")}
        onBlur={(e) =>
          (e.currentTarget.style.outline = "2px solid transparent")
        }
        onMouseOver={(e) => (e.currentTarget.style.background = "#005bb5")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#0070f3")}
      >
        Pick Random
      </button>
      {result && (
        <>
          <h2
            style={{
              fontSize: 20,
              margin: "24px 0 8px 0",
              textAlign: "center",
            }}
          >
            Result
          </h2>
          <div
            style={{
              marginTop: 4,
              fontWeight: "bold",
              fontSize: 20,
              textAlign: "center",
              wordBreak: "break-word",
            }}
            role="status"
            aria-live="polite"
          >
            🎉 {result}
          </div>
        </>
      )}
    </div>
  );
}

export default RandomChoicePicker;

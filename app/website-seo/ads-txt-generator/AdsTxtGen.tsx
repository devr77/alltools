"use client";
import React, { useState } from "react";

function AdsTxtGen() {
  const [entries, setEntries] = useState([
    { domain: "", publisherId: "", type: "DIRECT", certAuthId: "" },
  ]);
  const [adsTxt, setAdsTxt] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEntryChange = (idx: number, field: string, value: string) => {
    setEntries((entries) =>
      entries.map((entry, i) =>
        i === idx ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const handleAddEntry = () => {
    setEntries([
      ...entries,
      { domain: "", publisherId: "", type: "DIRECT", certAuthId: "" },
    ]);
  };

  const handleRemoveEntry = (idx: number) => {
    setEntries((entries) => entries.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = entries
      .filter((e) => e.domain && e.publisherId && e.type)
      .map(
        (e) =>
          `${e.domain}, ${e.publisherId}, ${e.type}${
            e.certAuthId ? `, ${e.certAuthId}` : ""
          }`,
      );
    setAdsTxt(lines.join("\n"));
    setShowResult(true);
  };

  const handleDownload = () => {
    const blob = new Blob([adsTxt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ads.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(adsTxt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div>
      <h2>ads.txt Generator</h2>
      <form onSubmit={handleSubmit}>
        {entries.map((entry, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 8,
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={entry.domain}
              onChange={(e) => handleEntryChange(idx, "domain", e.target.value)}
              placeholder="ad network domain"
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
                width: 140,
              }}
            />
            <input
              type="text"
              value={entry.publisherId}
              onChange={(e) =>
                handleEntryChange(idx, "publisherId", e.target.value)
              }
              placeholder="publisher id"
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
                width: 120,
              }}
            />
            <select
              value={entry.type}
              onChange={(e) => handleEntryChange(idx, "type", e.target.value)}
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
                width: 90,
              }}
            >
              <option value="DIRECT">DIRECT</option>
              <option value="RESELLER">RESELLER</option>
            </select>
            <input
              type="text"
              value={entry.certAuthId}
              onChange={(e) =>
                handleEntryChange(idx, "certAuthId", e.target.value)
              }
              placeholder="cert auth id (opt)"
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
                width: 140,
              }}
            />
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveEntry(idx)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "1.2em",
                }}
                title="Remove entry"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddEntry}
          style={{
            background: "#e0e7ff",
            color: "#3730a3",
            border: "none",
            borderRadius: "6px",
            padding: "6px 14px",
            fontWeight: 500,
            marginBottom: 10,
            cursor: "pointer",
          }}
        >
          + Add Entry
        </button>
        <br />
        <button
          type="submit"
          style={{
            background: "linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 22px",
            fontSize: "1rem",
            fontWeight: 600,
            boxShadow: "0 2px 8px rgba(60,60,120,0.08)",
            cursor: "pointer",
            marginTop: "8px",
            transition: "background 0.2s, transform 0.1s",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "linear-gradient(90deg, #4f46e5 0%, #2563eb 100%)";
            (e.currentTarget as HTMLButtonElement).style.transform =
              "translateY(-2px) scale(1.03)";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)";
            (e.currentTarget as HTMLButtonElement).style.transform = "none";
          }}
        >
          Generate ads.txt
        </button>
      </form>
      {showResult && (
        <div style={{ marginTop: 20 }}>
          <h3>Generated ads.txt</h3>
          <textarea
            rows={Math.max(6, entries.length + 2)}
            style={{ width: "100%" }}
            value={adsTxt}
            readOnly
          />
          <br />
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <button
              onClick={handleDownload}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="Download ads.txt"
            >
              {/* Download SVG icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download ads.txt
            </button>
            <button
              onClick={handleCopy}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: copied ? "#22c55e" : "inherit",
              }}
              title="Copy ads.txt"
            >
              {/* Copy SVG icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "2px" }}
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdsTxtGen;

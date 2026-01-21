"use client";
import React, { useState } from "react";
import FAQSection from "../../components/FAQSection";
import { websiteSEOFAQs } from "../../components/faqData";

function RobottxtGen() {
  const [userAgent, setUserAgent] = useState("*");
  const [allow, setAllow] = useState("/");
  const [disallow, setDisallow] = useState("");
  const [sitemap, setSitemap] = useState("");
  const [robots, setRobots] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let txt = `User-agent: ${userAgent}\n`;
    if (allow) txt += `Allow: ${allow}\n`;
    if (disallow) txt += `Disallow: ${disallow}\n`;
    if (sitemap) txt += `Sitemap: ${sitemap}\n`;
    setRobots(txt.trim());
    setShowResult(true);
  };

  const handleDownload = () => {
    const blob = new Blob([robots], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "robots.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(robots);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div>
      <h2>robots.txt Generator</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            User-agent:{" "}
            <input
              type="text"
              value={userAgent}
              onChange={(e) => setUserAgent(e.target.value)}
              placeholder="*"
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
              }}
            />
          </label>
        </div>
        <div>
          <label>
            Allow:{" "}
            <input
              type="text"
              value={allow}
              onChange={(e) => setAllow(e.target.value)}
              placeholder="/"
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
                marginTop: "8px",
              }}
            />
          </label>
        </div>
        <div>
          <label>
            Disallow:{" "}
            <input
              type="text"
              value={disallow}
              onChange={(e) => setDisallow(e.target.value)}
              placeholder="/private"
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
                marginTop: "8px",
              }}
            />
          </label>
        </div>
        <div>
          <label>
            Sitemap URL:{" "}
            <input
              type="text"
              value={sitemap}
              onChange={(e) => setSitemap(e.target.value)}
              placeholder="https://example.com/sitemap.xml"
              style={{
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
                marginTop: "8px",
              }}
            />
          </label>
        </div>
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
            marginTop: "16px",
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
          Generate robots.txt
        </button>
      </form>
      {showResult && (
        <div style={{ marginTop: 20 }}>
          <h3>Generated robots.txt</h3>
          <textarea
            rows={8}
            style={{ width: "100%" }}
            value={robots}
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
              title="Download robots.txt"
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
              Download robots.txt
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
              title="Copy robots.txt"
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
      <FAQSection faqs={websiteSEOFAQs} />
    </div>
  );
}

export default RobottxtGen;

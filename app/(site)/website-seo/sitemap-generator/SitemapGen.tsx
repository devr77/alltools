"use client";
import React, { useState } from "react";
import FAQSection from "@/app/components/FAQSection";
import { websiteSEOFAQs } from "@/app/components/faqData";

function SitemapGen() {
  const [baseUrl, setBaseUrl] = useState("");
  const [numPages, setNumPages] = useState(1);
  const [sitemap, setSitemap] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseUrl) return;
    let urls = "";
    for (let i = 1; i <= numPages; i++) {
      const url = i === 1 ? baseUrl : `${baseUrl.replace(/\/$/, "")}/page/${i}`;
      urls += `  <url>\n    <loc>${url}</loc>\n  </url>\n`;
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>`;
    setSitemap(xml);
    setShowResult(true);
  };

  const handleDownload = () => {
    const blob = new Blob([sitemap], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sitemap);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div>
      <h2>Sitemap Generator</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Base URL:{" "}
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="example.com"
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
            Number of pages:{" "}
            <input
              type="number"
              min={1}
              value={numPages}
              onChange={(e) => setNumPages(Number(e.target.value))}
              style={{
                marginTop: "8px",
                outline: "2px solid #6366f1",
                outlineOffset: "2px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                padding: "4px 8px",
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
          Generate Sitemap
        </button>
      </form>
      {showResult && (
        <div style={{ marginTop: 20 }}>
          <h3>Generated Sitemap.xml</h3>
          <textarea
            rows={Math.min(20, numPages + 5)}
            style={{ width: "100%" }}
            value={sitemap}
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
              title="Download sitemap.xml"
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
              Download Sitemap.xml
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
              title="Copy sitemap.xml"
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

export default SitemapGen;

"use client";
import React, { useState } from "react";
import FAQSection from "@/app/components/FAQSection";
import { websiteSEOFAQs } from "@/app/components/faqData";

function SitemapValidator() {
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateSitemap = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(sitemapUrl);
      if (!res.ok) {
        setResult("Could not fetch sitemap. Check the URL.");
        setLoading(false);
        return;
      }
      const text = await res.text();
      if (
        text.includes("<urlset") &&
        text.includes("<loc>") &&
        text.includes("</urlset>")
      ) {
        setResult("✅ Valid XML Sitemap!");
      } else {
        setResult("❌ Not a valid XML sitemap.");
      }
    } catch {
      setResult("❌ Error fetching or parsing the sitemap.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
        Sitemap Validator Tool
      </h1>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 500, marginBottom: 18 }}>
        Check if your XML sitemap is valid and accessible
      </h2>
      <form onSubmit={validateSitemap}>
        <label>
          Sitemap URL:{" "}
          <input
            type="text"
            value={sitemapUrl}
            onChange={(e) => setSitemapUrl(e.target.value)}
            placeholder="https://example.com/sitemap.xml"
            style={{
              outline: "2px solid #6366f1",
              outlineOffset: "2px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              padding: "4px 8px",
              width: "320px",
            }}
          />
        </label>
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
            marginLeft: "16px",
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
          disabled={loading}
        >
          {loading ? "Validating..." : "Validate"}
        </button>
      </form>
      {result && <div style={{ marginTop: 20, fontWeight: 500 }}>{result}</div>}
      <FAQSection faqs={websiteSEOFAQs} />
    </div>
  );
}

export default SitemapValidator;

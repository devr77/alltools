"use client";
import React, { useState } from "react";
import { usePDFJS } from "@/app/hooks/usePDFJS";

function PdftoMarkdown() {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  usePDFJS(async (loadedPdfjs) => {
    setPdfjs(loadedPdfjs);
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setMarkdown("");
    setLoading(true);
    try {
      const file = e.target.files?.[0];
      if (!file) throw new Error("No file selected.");
      const arrayBuffer = await file.arrayBuffer();

      if (!pdfjs) throw new Error("PDF.js not loaded yet.");
      pdfjs.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js";

      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text +=
          content.items
            .map((item: any) => ("str" in item ? item.str : ""))
            .join(" ") + "\n\n";
      }
      setMarkdown(text.trim());
    } catch (err: any) {
      setError(
        "Failed to extract text from PDF. " +
          (err?.message ? `Error: ${err.message}` : ""),
      );
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div>
      <h2>PDF to Markdown Converter</h2>
      {/* Outlined upload button with icon */}
      <label
        htmlFor="pdf-upload"
        style={{
          display: "inline-flex",
          alignItems: "center",
          border: "2px solid #0070f3",
          background: "white",
          color: "#0070f3",
          padding: "8px 18px",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 500,
          marginBottom: 12,
          gap: 8,
        }}
      >
        {/* Upload icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 16V4M12 4l-5 5M12 4l5 5"
            stroke="#0070f3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="4"
            y="16"
            width="16"
            height="4"
            rx="2"
            stroke="#0070f3"
            strokeWidth="2"
            fill="none"
          />
        </svg>
        {loading ? "Uploading..." : "Upload PDF"}
      </label>
      <input
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        onChange={handleFile}
        disabled={loading || !pdfjs}
        style={{ display: "none" }}
      />
      {!pdfjs && <div>Loading PDF.js library...</div>}
      {loading && <div>Converting...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {markdown && (
        <div style={{ marginTop: 16 }}>
          <h3>Extracted Markdown:</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <textarea
              rows={12}
              cols={60}
              value={markdown}
              readOnly
              style={{ width: "100%", fontFamily: "monospace" }}
            />
            <button
              onClick={handleCopy}
              style={{
                border: "2px solid #0070f3",
                background: copied ? "#0070f3" : "white",
                color: copied ? "white" : "#0070f3",
                padding: "8px",
                borderRadius: "5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontWeight: 500,
                minWidth: 40,
                height: 40,
              }}
              title="Copy to clipboard"
            >
              {/* Copy icon SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
              >
                <rect
                  x="9"
                  y="9"
                  width="13"
                  height="13"
                  rx="2"
                  stroke={copied ? "white" : "#0070f3"}
                  strokeWidth="2"
                  fill="none"
                />
                <rect
                  x="3"
                  y="3"
                  width="13"
                  height="13"
                  rx="2"
                  stroke={copied ? "white" : "#0070f3"}
                  strokeWidth="2"
                  fill="none"
                  opacity="0.5"
                />
              </svg>
              {copied ? "Copied!" : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PdftoMarkdown;

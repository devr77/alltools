"use client";
import React, { useState } from "react";
import { usePDFJS } from "@/app/hooks/usePDFJS";
import FAQSection from "@/app/components/FAQSection";
import { dataConverterFAQs } from "@/app/components/faqData";

/**
 * Text → Markdown converter (rules-based)
 */
function textToMarkdown(text: string) {
  const lines = text.split("\n");
  const md: string[] = [];
  let prevEmpty = false;

  for (const raw of lines) {
    const line = raw.trim();

    // paragraph break
    if (!line) {
      if (!prevEmpty) md.push("");
      prevEmpty = true;
      continue;
    }
    prevEmpty = false;

    // ALL CAPS → H1
    if (/^[A-Z\s]{5,}$/.test(line)) {
      md.push(`# ${line}`);
      continue;
    }

    // ends with ":" → H2
    if (line.endsWith(":")) {
      md.push(`## ${line.replace(/:$/, "")}`);
      continue;
    }

    // unordered list
    if (/^[-*•]\s+/.test(line)) {
      md.push(`- ${line.replace(/^[-*•]\s+/, "")}`);
      continue;
    }

    // ordered list
    if (/^\d+\.\s+/.test(line)) {
      md.push(line);
      continue;
    }

    // default paragraph
    md.push(line);
  }

  return md.join("\n");
}

function PdftoMarkdown() {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  usePDFJS(async (loadedPdfjs) => {
    loadedPdfjs.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js";
    setPdfjs(loadedPdfjs);
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setMarkdown("");
    setLoading(true);

    try {
      const file = e.target.files?.[0];
      if (!file) throw new Error("No file selected");
      if (!pdfjs) throw new Error("PDF.js not loaded");

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      let extractedText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        extractedText +=
          content.items
            .map((item: any) => ("str" in item ? item.str : ""))
            .join(" ") + "\n\n";

        // prevent UI blocking on large PDFs
        await new Promise((r) => setTimeout(r, 0));
      }

      // ✅ TEXT → MARKDOWN
      const markdownResult = textToMarkdown(extractedText.trim());
      setMarkdown(markdownResult);
    } catch (err: any) {
      setError(
        "Failed to convert PDF to Markdown. " +
          (err?.message ? `Error: ${err.message}` : ""),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div>
      <h2>PDF to Markdown Converter</h2>

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
        Upload PDF
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
      {loading && <div>Converting PDF to Markdown…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {markdown && (
        <div style={{ marginTop: 16 }}>
          <h3>Generated Markdown</h3>

          <div style={{ display: "flex", gap: 8 }}>
            <textarea
              rows={14}
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
                borderRadius: 5,
                width: 44,
                height: 44,
                cursor: "pointer",
                fontWeight: 600,
              }}
              title="Copy Markdown"
            >
              {copied ? "✓" : "⧉"}
            </button>
          </div>
        </div>
      )}
      <FAQSection faqs={dataConverterFAQs} />
    </div>
  );
}

export default PdftoMarkdown;

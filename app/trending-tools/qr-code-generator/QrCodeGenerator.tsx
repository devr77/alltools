"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import FAQSection from "../../components/FAQSection";
import { trendingToolsFAQs } from "../../components/faqData";

export default function QRCodeGeneratorPage() {
  const [content, setContent] = useState("");
  const [size, setSize] = useState(220);
  const [margin, setMargin] = useState(1);
  const [ecc, setEcc] = useState<"L" | "M" | "Q" | "H">("M");
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const qrSrc = useMemo(() => {
    if (!content.trim()) return "";
    const base = "https://api.qrserver.com/v1/create-qr-code/";
    return `${base}?data=${encodeURIComponent(
      content.trim(),
    )}&size=${size}x${size}&ecc=${ecc}&margin=${margin}`;
  }, [content, size, ecc, margin]);

  const handleDownload = async () => {
    if (!qrSrc) return;
    try {
      setIsDownloading(true);
      const res = await fetch(qrSrc);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "qr-code.png";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!qrSrc || !navigator?.clipboard) return;
    await navigator.clipboard.writeText(qrSrc);
  };

  // Auto-expand textarea height
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = contentRef.current.scrollHeight + "px";
    }
  }, [content]);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 sm:px-6 md:px-8 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold mb-2">QR Code Generator</h1>
        <h2 className="text-xl font-medium mb-2">
          Create QR codes for links, text, or any content
        </h2>
        <p className="text-muted mb-6">
          Adjust size, margin, and error correction, then copy or download the
          image.
        </p>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter text or URL"
                className="w-full min-h-[40px] max-h-[300px] resize-none rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                rows={1}
                style={{ overflow: "hidden" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Size (px)</label>
                <input
                  type="number"
                  min={120}
                  max={800}
                  step={20}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value) || 120)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Margin (px)</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value) || 0)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Error correction</label>
              <select
                value={ecc}
                onChange={(e) => setEcc(e.target.value as typeof ecc)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="L">Low (L) – 7%</option>
                <option value="M">Medium (M) – 15%</option>
                <option value="Q">Quartile (Q) – 25%</option>
                <option value="H">High (H) – 30%</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 flex flex-col items-center justify-center">
            {qrSrc ? (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg border border-border">
                  <img
                    src={qrSrc}
                    alt="Generated QR code"
                    className="w-full h-auto max-w-xs"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleCopy}
                    disabled={!qrSrc}
                    className="rounded-md border border-border bg-background px-4 py-2 text-sm hover:border-white disabled:opacity-50"
                  >
                    Copy image URL
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={!qrSrc || isDownloading}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {isDownloading ? "Downloading…" : "Download PNG"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-muted text-center">
                Enter content to generate a QR code.
              </p>
            )}
          </div>
        </section>
        <FAQSection faqs={trendingToolsFAQs} />
      </div>
    </main>
  );
}

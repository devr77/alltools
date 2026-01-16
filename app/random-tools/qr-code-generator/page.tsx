"use client";

import Head from "next/head";
import { useMemo, useState } from "react";

export default function QRCodeGeneratorPage() {
  const [content, setContent] = useState("");
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(1);
  const [ecc, setEcc] = useState<"L" | "M" | "Q" | "H">("M");
  const [isDownloading, setIsDownloading] = useState(false);

  const qrSrc = useMemo(() => {
    if (!content.trim()) return "";
    const base = "https://api.qrserver.com/v1/create-qr-code/";
    return `${base}?data=${encodeURIComponent(
      content.trim()
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

  return (
    <>
      <Head>
        <title>QR Code Generator | AllTools</title>
        <meta
          name="description"
          content="Create QR codes for links, text, or any content. Adjust size, margin, and error correction, then copy or download the image."
        />
        <link
          rel="canonical"
          href="https://alltools.dev/random-tools/qr-code-generator"
        />
        <meta property="og:title" content="QR Code Generator | AllTools" />
        <meta
          property="og:description"
          content="Generate QR codes instantly with custom size, margin, and error correction."
        />
        <meta
          property="og:url"
          content="https://alltools.dev/random-tools/qr-code-generator"
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="QR Code Generator | AllTools" />
        <meta
          name="twitter:description"
          content="Generate QR codes instantly with custom size, margin, and error correction."
        />
      </Head>
      <div className="min-h-screen bg-zinc-50 dark:bg-black px-4 sm:px-6 md:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted">
              QR Code
            </p>
            <h1 className="text-3xl font-semibold">QR Code Generator</h1>
            <p className="text-muted">
              Create QR codes for links, text, or any content. Adjust size,
              margin, and error correction, then copy or download the image.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4 rounded-lg border border-border bg-card p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter text or URL"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
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
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import FAQSection from "@/app/components/FAQSection";
import { parseQrContent, type QrContent } from "@/app/lib/qr-content";
import { decodeFrom, decodeImage, loadDecoder } from "@/app/lib/qr-decode";
import { toCsv, toJson, type DecodedQr } from "./export";
import { MAX_FILES, qrReaderFaqs } from "./faqs";
import styles from "./QrCodeReader.module.css";


type Entry = {
  id: number; source: string; preview?: string;
  state: "reading" | "found" | "missing" | "error";
  raw?: string; content?: QrContent; error?: string;
};

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

function download(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = Object.assign(document.createElement("a"), { href: url, download: name });
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export default function QrCodeReader() {
  const posthog = usePostHog();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);
  const [scanning, setScanning] = useState(false);
  const nextId = useRef(1);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const previews = useRef<string[]>([]);

  const update = (id: number, change: Partial<Entry>) => setEntries((list) => list.map((entry) => (entry.id === id ? { ...entry, ...change } : entry)));

  const addResult = useCallback((source: string, raw: string, preview?: string) => {
    const content = parseQrContent(raw);
    setEntries((list) => [{ id: nextId.current++, source, preview, state: "found", raw, content }, ...list]);
    posthog?.capture("qr_reader_decoded", { source: preview ? "image" : "camera", kind: content.kind });
  }, [posthog]);

  const readFiles = useCallback(async (files: File[]) => {
    setError("");
    setMessage("");
    const images = files.filter((file) => file.type.startsWith("image/"));
    const skipped = files.length - images.length;
    if (!images.length) { if (files.length) setError("Choose image files (PNG, JPG, WebP, GIF, or a screenshot)."); return; }
    const batch = images.slice(0, MAX_FILES).map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.push(preview);
      return { file, entry: { id: nextId.current++, source: file.name || "Pasted image", preview, state: "reading" as const } };
    });
    setEntries((list) => [...batch.map(({ entry }) => entry).reverse(), ...list]);
    const notes = [];
    if (skipped) notes.push(`${skipped} non-image file${skipped === 1 ? " was" : "s were"} skipped.`);
    if (images.length > MAX_FILES) notes.push(`Only the first ${MAX_FILES} images were read.`);
    if (notes.length) setError(notes.join(" "));
    let found = 0;
    for (const { file, entry } of batch) {
      try {
        const raw = await decodeImage(file);
        if (raw === null) update(entry.id, { state: "missing" });
        else {
          found++;
          const content = parseQrContent(raw);
          update(entry.id, { state: "found", raw, content });
          posthog?.capture("qr_reader_decoded", { source: "image", kind: content.kind });
        }
      } catch (cause) {
        update(entry.id, { state: "error", error: cause instanceof Error ? cause.message : "Couldn't read this image." });
      }
    }
    setMessage(`Read ${batch.length} image${batch.length === 1 ? "" : "s"}: ${found} QR code${found === 1 ? "" : "s"} found.`);
  }, [posthog]);

  const stopCamera = useCallback(() => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    setScanning(false);
  }, []);

  async function startCamera() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) { setError("Camera access isn't available in this browser. Upload a photo of the code instead."); return; }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      setScanning(true);
    } catch {
      setError("Camera access was blocked or no camera was found. Allow camera access, or upload a photo of the code.");
    }
  }

  useEffect(() => {
    if (!scanning || !video.current || !stream.current) return;
    const element = video.current;
    element.srcObject = stream.current;
    element.play().catch(() => {});
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (stopped) return;
      if (element.readyState >= 2 && element.videoWidth) {
        const jsQR = await loadDecoder();
        const raw = decodeFrom(jsQR, element, element.videoWidth, element.videoHeight, 900);
        if (raw !== null && !stopped) { stopCamera(); addResult("Camera scan", raw); setMessage("QR code scanned."); return; }
      }
      timer = setTimeout(tick, 200);
    };
    tick();
    return () => { stopped = true; clearTimeout(timer); };
  }, [scanning, addResult, stopCamera]);

  useEffect(() => () => {
    stopCamera();
    previews.current.forEach((url) => URL.revokeObjectURL(url));
  }, [stopCamera]);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if ((event.target as HTMLElement)?.closest?.("input, textarea, [contenteditable]")) return;
      const files = [...(event.clipboardData?.files || [])];
      if (!files.length) return;
      event.preventDefault();
      readFiles(files);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [readFiles]);

  const decoded: DecodedQr[] = entries.filter((entry) => entry.state === "found").map(({ source, raw, content }) => ({ source, raw, content }));

  async function copy(text: string, note: string) {
    try { await copyText(text); setMessage(note); } catch { setMessage("Copy unavailable. Select the text and copy it manually."); }
  }

  function clear() {
    previews.current.forEach((url) => URL.revokeObjectURL(url));
    previews.current = [];
    setEntries([]);
    setMessage("");
    setError("");
  }

  return (
    <div className={styles.tool}>
      <h1>QR Code Reader</h1>
      <p>Upload a QR code image, paste a screenshot, or scan with your camera to extract the link, text, Wi‑Fi password, or contact details inside. Everything is decoded in your browser.</p>

      <div className={`${styles.workspace} ph-no-capture ph-mask`}>
        {scanning ? (
          <div className={styles.camera}>
            <video ref={video} playsInline muted aria-label="Camera preview" />
            <p>Point your camera at a QR code…</p>
            <button type="button" onClick={stopCamera}>Stop camera</button>
          </div>
        ) : (
          <>
            <input id="qr-files" className={styles.hidden} type="file" accept="image/*" multiple
              onChange={(event) => { readFiles([...(event.target.files || [])]); event.target.value = ""; }} />
            <label
              htmlFor="qr-files" className={`${styles.drop}${over ? ` ${styles.over}` : ""}`}
              onDragEnter={(event) => { event.preventDefault(); setOver(true); }}
              onDragOver={(event) => { event.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={(event) => { event.preventDefault(); setOver(false); readFiles([...event.dataTransfer.files]); }}
            >
              <span className={styles.dropIcon} aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M3 12h.01M12 3h.01M12 16v.01M16 12h1M21 12v.01M12 21v-1" /></svg>
              </span>
              <strong>Drop QR code images here</strong>
              <span>or <u>choose files</u> · paste a screenshot with Ctrl+V</span>
              <small>Up to {MAX_FILES} images at once · PNG, JPG, WebP, GIF</small>
            </label>
          </>
        )}
        <div className={styles.actions}>
          {!scanning && <button type="button" onClick={startCamera}>Scan with camera</button>}
          {decoded.length > 0 && <>
            <button type="button" onClick={() => copy(decoded.map((row) => row.raw).join("\n"), `${decoded.length} result${decoded.length === 1 ? "" : "s"} copied.`)}>Copy all</button>
            <button type="button" onClick={() => download(toCsv(decoded), "qr-codes.csv", "text/csv;charset=utf-8")}>Download CSV</button>
            <button type="button" onClick={() => download(toJson(decoded), "qr-codes.json", "application/json")}>Download JSON</button>
          </>}
          {entries.length > 0 && <button type="button" onClick={clear}>Clear</button>}
        </div>
      </div>

      {error && <p role="alert" className={styles.error}>{error}</p>}
      <p role="status" className={styles.status}>{message}</p>

      {entries.length > 0 && (
        <section className={`${styles.results} ph-no-capture ph-mask`} aria-label="Decoded QR codes">
          <h2>Results</h2>
          <ul>
            {entries.map((entry) => <Result key={entry.id} entry={entry} onCopy={copy} />)}
          </ul>
        </section>
      )}

      <section className={styles.help}>
        <h2>How to extract data from a QR code</h2>
        <ol>
          <li><strong>Add the code.</strong> Drop or choose one or more images, paste a screenshot, or scan with your camera.</li>
          <li><strong>Review the result.</strong> Links show their domain first, and warnings flag insecure or suspicious addresses.</li>
          <li><strong>Copy or export.</strong> Copy a single value, copy everything, or download all results as CSV or JSON.</li>
        </ol>
        <p>Want to make your own code? Use the <Link href="/trending-tools/qr-code-generator">QR Code Generator</Link>.</p>
      </section>

      <FAQSection faqs={qrReaderFaqs} />
    </div>
  );
}

function Result({ entry, onCopy }: { entry: Entry; onCopy: (text: string, note: string) => void }) {
  const { content } = entry;
  return (
    <li className={styles.result}>
      {entry.preview
        // Local object-URL preview of the user's own image; next/image does not apply.
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={entry.preview} alt="" className={styles.thumb} />
        : <span className={styles.thumb} aria-hidden="true">📷</span>}
      <div className={styles.body}>
        <div className={styles.head}>
          <span className={styles.source}>{entry.source}</span>
          {content && <span className={styles.kind}>{content.label}</span>}
        </div>
        {entry.state === "reading" && <p className={styles.muted}>Reading…</p>}
        {entry.state === "missing" && <p className={styles.muted}>No QR code found in this image. Try a sharper, straight-on photo with the whole code visible.</p>}
        {entry.state === "error" && <p className={styles.error}>{entry.error}</p>}
        {entry.state === "found" && content && <>
          {content.kind === "url" && <p className={styles.domain}>{new URL(content.href).hostname}</p>}
          {content.warnings.map((warning) => <p key={warning} className={styles.warning}>⚠ {warning}</p>)}
          {content.fields.length > 0 && content.kind !== "url" && (
            <dl className={styles.fields}>
              {content.fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
          )}
          <textarea className={styles.raw} readOnly value={entry.raw} aria-label={`Decoded content from ${entry.source}`}
            rows={Math.min(6, Math.max(2, Math.ceil(entry.raw.length / 70)))} onFocus={(event) => event.target.select()} />
          <div className={styles.rowActions}>
            <button type="button" className={styles.primary} onClick={() => onCopy(entry.raw, "Copied.")}>{content.kind === "url" ? "Copy link" : "Copy text"}</button>
            {content.kind === "wifi" && content.fields.find(([label]) => label === "Password") && (
              <button type="button" onClick={() => onCopy(content.fields.find(([label]) => label === "Password")[1], "Wi‑Fi password copied.")}>Copy password</button>
            )}
            {content.href && <a href={content.href} target="_blank" rel="noopener noreferrer nofollow">{content.kind === "geo" ? "Open map ↗" : "Open ↗"}</a>}
          </div>
        </>}
      </div>
    </li>
  );
}

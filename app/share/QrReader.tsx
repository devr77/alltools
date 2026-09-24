"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePostHog } from "posthog-js/react";
import Icon from "./Icon";
import { parseQrContent, type QrContent } from "./lib/qr";

type JsQr = typeof import("jsqr").default;
let decoderPromise: Promise<JsQr> | null = null;
// Loaded on first use so pages that never decode don't download it.
const loadDecoder = () => (decoderPromise ??= import("jsqr").then((module) => module.default));

/** Draws the source with a white quiet zone at a given longest side and tries to decode it. */
function decodeFrom(jsQR: JsQr, source: CanvasImageSource, width: number, height: number, longest: number) {
  const scale = Math.min(1, longest / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale)), h = Math.max(1, Math.round(height * scale));
  const pad = Math.round(Math.max(w, h) * 0.08);
  const canvas = document.createElement("canvas");
  canvas.width = w + pad * 2;
  canvas.height = h + pad * 2;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, pad, pad, w, h);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(data, canvas.width, canvas.height, { inversionAttempts: "attemptBoth" })?.data ?? null;
}

async function decodeImage(file: Blob) {
  const jsQR = await loadDecoder();
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This image couldn't be opened. Try a PNG, JPG, or WebP file, or a screenshot.");
  }
  try {
    // Large photos decode better downscaled; small codes decode better at full size. Try a few sizes.
    for (const longest of [1400, 900, 600, 2400]) {
      const result = decodeFrom(jsQR, bitmap, bitmap.width, bitmap.height, longest);
      if (result !== null) return result;
    }
    return null;
  } finally {
    bitmap.close();
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.style.cssText = "position:fixed;opacity:0";
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }
}

export default function QrReader() {
  const posthog = usePostHog();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);
  const [result, setResult] = useState<{ raw: string; content: QrContent; preview?: string } | null>(null);
  const [scanning, setScanning] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const preview = useRef<string | undefined>(undefined);

  const show = useCallback((raw: string, source: "image" | "camera", image?: string) => {
    const content = parseQrContent(raw);
    if (preview.current && preview.current !== image) URL.revokeObjectURL(preview.current);
    preview.current = image;
    setResult({ raw, content, preview: image });
    setError("");
    posthog?.capture("share_qr_decoded", { source, kind: content.kind });
  }, [posthog]);

  const readFile = useCallback(async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError(`“${file.name}” is not an image.`); return; }
    setBusy(true);
    setError("");
    try {
      const text = await decodeImage(file);
      if (text === null) {
        setResult(null);
        setError("No QR code found. Make sure the whole code is visible, in focus, and not too small, then try again.");
      } else {
        show(text, "image", URL.createObjectURL(file));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't read this image.");
    } finally {
      setBusy(false);
    }
  }, [show]);

  const stopCamera = useCallback(() => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    setScanning(false);
  }, []);

  const startCamera = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) { setError("Your browser doesn't allow camera access here. Upload a photo of the code instead."); return; }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      setResult(null);
      setScanning(true);
    } catch {
      setError("Camera access was blocked or no camera was found. Allow camera access in your browser, or upload a photo of the code.");
    }
  };

  // Attach the stream and poll frames while scanning; stop on unmount.
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
        const text = decodeFrom(jsQR, element, element.videoWidth, element.videoHeight, 900);
        if (text !== null && !stopped) { stopCamera(); show(text, "camera"); return; }
      }
      timer = setTimeout(tick, 200);
    };
    tick();
    return () => { stopped = true; clearTimeout(timer); };
  }, [scanning, show, stopCamera]);
  useEffect(() => () => { stopCamera(); if (preview.current) URL.revokeObjectURL(preview.current); }, [stopCamera]);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if ((event.target as HTMLElement)?.closest?.("input, textarea, [contenteditable]")) return;
      const file = [...(event.clipboardData?.files || [])].find((entry) => entry.type.startsWith("image/"));
      if (!file) return;
      event.preventDefault();
      readFile(file);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [readFile]);

  return (
    <div id="uploader" className="ph-no-capture ph-mask">
      {scanning ? (
        <div className="camera">
          <video ref={video} playsInline muted aria-label="Camera preview" />
          <span className="camera-frame" aria-hidden="true" />
          <p className="camera-hint">Point your camera at a QR code…</p>
          <button type="button" className="button button-ghost" onClick={stopCamera}><Icon name="x" size={16} /> Stop camera</button>
        </div>
      ) : (
        <div>
          <input id="file-input" className="visually-hidden" type="file" accept="image/*"
            onChange={(event) => { readFile(event.target.files?.[0]); event.target.value = ""; }} />
          <label
            htmlFor="file-input" className={`dropzone${over ? " is-over" : ""}`}
            onDragEnter={(event) => { event.preventDefault(); setOver(true); }}
            onDragOver={(event) => { event.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(event) => { event.preventDefault(); setOver(false); readFile(event.dataTransfer.files[0]); }}
          >
            <span className="dropzone-icon"><Icon name="qr" size={30} /></span>
            <strong>{busy ? "Reading QR code…" : "Drop a QR code image"}</strong>
            <span>or <u>browse your device</u> · paste a screenshot with Ctrl+V</span>
            <small>PNG, JPG, WebP, screenshots, and photos · decoded on your device</small>
          </label>
        </div>
      )}
      {!scanning && (
        <button type="button" className="button button-ghost camera-button" onClick={startCamera}>
          <Icon name="camera" size={18} /> Scan with camera
        </button>
      )}

      {error && <p className="alert" role="alert">{error}</p>}

      {result && (
        <section className="qr-result" aria-live="polite" aria-label="Decoded QR code">
          <div className="qr-result-head">
            {result.preview && (
              // Local object-URL preview of the user's own image; next/image does not apply.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result.preview} alt="" />
            )}
            <div>
              <span className="qr-kind">{result.content.label}</span>
              <h3>{result.content.href && result.content.kind === "url" ? new URL(result.content.href).hostname : "Decoded content"}</h3>
            </div>
          </div>

          {result.content.warnings.map((warning) => <p key={warning} className="qr-warning"><Icon name="shield" size={15} /> {warning}</p>)}

          {result.content.fields.length > 0 && result.content.kind !== "url" && (
            <dl className="qr-fields">
              {result.content.fields.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}{label === "Password" && <button type="button" className="text-button" onClick={() => copyText(value)}><Icon name="copy" size={13} /> Copy</button>}</dd>
                </div>
              ))}
            </dl>
          )}

          <label className="qr-raw">
            <span>{result.content.kind === "url" ? "Full link" : "Raw text"}</span>
            <textarea readOnly value={result.raw} rows={Math.min(8, Math.max(2, Math.ceil(result.raw.length / 70)))} onFocus={(event) => event.target.select()} />
          </label>

          <div className="qr-actions">
            <CopyButton text={result.raw} label={result.content.kind === "url" ? "Copy link" : "Copy text"} />
            {result.content.href && (
              <a className="icon-button" href={result.content.href} target="_blank" rel="noopener noreferrer nofollow">
                <Icon name="external" size={16} /> {result.content.kind === "url" ? "Open link" : result.content.kind === "geo" ? "Open map" : "Open"}
              </a>
            )}
            <button type="button" className="text-button" onClick={() => setResult(null)}>Scan another</button>
          </div>
        </section>
      )}
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" className="icon-button primary" onClick={async () => { await copyText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); }}>
      <Icon name={copied ? "check" : "copy"} size={16} /> {copied ? "Copied" : label}
    </button>
  );
}

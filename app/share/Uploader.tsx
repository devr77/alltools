"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePostHog } from "posthog-js/react";
import Icon from "./Icon";
import type { ShareTool } from "./catalog";
import { decodeBase64Input, extensionForType, formatBytes, resolveContentType, timeLeft, uploadBlob, validateFile } from "./lib/upload";
import { canCompressImage, compressImage, minifyJson, PRESETS } from "./lib/compress";

export type UploaderSettings = {
  api: string; uploadWindow: number; maxBytes: number; maxFiles: number;
  lifetimes: { days: number; label: string }[]; defaultLifetime: number;
};

type Item = {
  id: string; name: string; size: number; type: string; blob?: Blob; preview?: string | null;
  state: "waiting" | "compressing" | "uploading" | "done" | "error"; progress: number; originalSize?: number;
  url?: string; deletesAt?: number; remaining?: number | null; error?: string; saved?: boolean;
};

const HISTORY_KEY = "tbshare:links:v1";
const LIFETIME_KEY = "tbshare:lifetime";
const COMPRESS_KEY = "tbshare:compress";

const store = {
  get<T>(key: string, fallback: T): T {
    try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; } catch { return fallback; }
  },
  set(key: string, value: unknown) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* history is a convenience only */ }
  },
};

const stamp = () => new Date().toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "-");
const bucket = (size: number) => (size < 1e6 ? "<1MB" : size < 1e7 ? "1-10MB" : size < 5e7 ? "10-50MB" : ">50MB");
const typeIcon = (type: string) => (type.startsWith("image/") ? "image" : type.startsWith("video/") ? "video" : type.startsWith("audio/") ? "audio"
  : type === "application/pdf" ? "pdf" : type === "application/json" ? "json" : type.startsWith("text/") ? "text" : "file");
let counter = 0;
const newId = () => `u${Date.now()}-${counter++}`;

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

export default function Uploader({ tool, settings }: { tool: ShareTool; settings: UploaderSettings }) {
  const posthog = usePostHog();
  const [items, setItems] = useState<Item[]>([]);
  const [lifetime, setLifetime] = useState(settings.defaultLifetime);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);
  const [text, setText] = useState("");
  const [compress, setCompress] = useState(true);
  const compressRef = useRef(compress);
  compressRef.current = compress;
  // Size reduction applies to tools that take raster images (any-file tools included) and to JSON.
  const anyFile = !tool.accept?.types.length && !tool.accept?.extensions.length;
  const imageCapable = tool.mode === "file" && (anyFile || tool.accept.types.some((type) => type.startsWith("image/")));
  const reducible = imageCapable || tool.json;
  const queue = useRef<Item[]>([]);
  const running = useRef(false);
  const lifetimeRef = useRef(lifetime);
  lifetimeRef.current = lifetime;

  // Restore the remembered lifetime and unexpired links after mount (browser storage only).
  useEffect(() => {
    setCompress(store.get<boolean>(COMPRESS_KEY, true) !== false);
    const saved = store.get<number>(LIFETIME_KEY, settings.defaultLifetime);
    if (settings.lifetimes.some((entry) => entry.days === saved)) setLifetime(saved);
    const history = store.get<Item[]>(HISTORY_KEY, []).filter((entry) => entry?.url && entry.deletesAt * 1000 > Date.now());
    store.set(HISTORY_KEY, history.map(({ url, name, size, type, deletesAt }) => ({ url, name, size, type, deletesAt })));
    setItems(history.map((entry) => ({ ...entry, id: newId(), state: "done", progress: 1, saved: true })));
  }, [settings]);

  const patch = (id: string, change: Partial<Item>) => setItems((list) => list.map((item) => (item.id === id ? { ...item, ...change } : item)));

  const run = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    let job: Item | undefined;
    while ((job = queue.current.shift())) {
      let { blob, type, name } = job;
      const { id } = job;
      try {
        if (compressRef.current && canCompressImage(type)) {
          patch(id, { state: "compressing" });
          const reduced = await compressImage(blob, type, tool.pasteFirst ? PRESETS.screenshot : PRESETS.photo);
          if (reduced.changed) {
            ({ blob, type, name } = reduced);
            patch(id, { name, type, size: blob.size, originalSize: reduced.originalSize });
          }
        }
        patch(id, { state: "uploading" });
        const slot = await uploadBlob(settings.api, blob, {
          contentType: type, deleteAfterDays: lifetimeRef.current, expiresIn: settings.uploadWindow,
          onProgress: (fraction: number) => patch(id, { progress: fraction }),
        });
        patch(id, { state: "done", progress: 1, url: slot.publicUrl, deletesAt: slot.deletesAt, remaining: slot.remaining });
        const history = store.get<Item[]>(HISTORY_KEY, []);
        store.set(HISTORY_KEY, [{ url: slot.publicUrl, name, size: blob.size, type, deletesAt: slot.deletesAt }, ...history].slice(0, 30));
        posthog?.capture("share_upload_completed", { tool: tool.slug, lifetime: lifetimeRef.current, size_bucket: bucket(blob.size), reduced: blob.size < job.blob.size });
      } catch (cause) {
        patch(id, { state: "error", error: cause instanceof Error ? cause.message : "Upload failed." });
        posthog?.capture("share_upload_failed", { tool: tool.slug });
      }
    }
    running.current = false;
  }, [settings, tool.slug, tool.pasteFirst, posthog]);

  const enqueue = useCallback((jobs: Pick<Item, "blob" | "name" | "type" | "preview" | "originalSize">[]) => {
    const created = jobs.map((job) => ({ ...job, id: newId(), size: job.blob.size, state: "waiting" as const, progress: 0 }));
    queue.current.push(...created);
    setItems((list) => [...created.reverse(), ...list]);
    run();
  }, [run]);

  const addFiles = useCallback((files: File[]) => {
    setError("");
    if (!files.length) return;
    const room = settings.maxFiles - queue.current.length;
    const problems: string[] = [];
    if (files.length > room) problems.push(`You can add up to ${settings.maxFiles} files at a time; ${files.length - Math.max(room, 0)} were skipped.`);
    const jobs = [];
    for (const file of files.slice(0, Math.max(room, 0))) {
      const problem = validateFile(file, { accept: tool.accept, maxBytes: settings.maxBytes, label: tool.label });
      if (problem) problems.push(problem);
      else jobs.push({ blob: file, name: file.name, type: resolveContentType(file.name, file.type), preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null });
    }
    if (jobs.length) enqueue(jobs);
    setError(problems.join(" "));
  }, [enqueue, settings, tool]);

  // Paste files anywhere on the page (file tools only). Pasted clipboard images get a timestamped name.
  useEffect(() => {
    if (tool.mode !== "file") return;
    const onPaste = (event: ClipboardEvent) => {
      if ((event.target as HTMLElement)?.closest?.("input, textarea, [contenteditable]")) return;
      const files = [...(event.clipboardData?.files || [])];
      if (!files.length) return;
      event.preventDefault();
      addFiles(files.map((file) => (/^image\.\w+$/.test(file.name) || !file.name
        ? new File([file], `screenshot-${stamp()}.${extensionForType(file.type)}`, { type: file.type }) : file)));
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [tool.mode, addFiles]);

  // Warn before leaving mid-upload.
  const busy = items.some((item) => item.state === "waiting" || item.state === "compressing" || item.state === "uploading");
  useEffect(() => {
    if (!busy) return;
    const onLeave = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [busy]);

  /* Text / JSON / Base64 */
  const encodeText = () => {
    if (tool.mode === "base64") {
      const { bytes, contentType } = decodeBase64Input(text);
      return { blob: new Blob([bytes], { type: contentType }), type: contentType, name: `base64-${stamp()}.${extensionForType(contentType)}`, originalSize: undefined };
    }
    if (!text.trim()) throw new Error("Type or paste some text first.");
    const body = tool.json && compress ? minifyJson(text) : text;
    if (tool.json) JSON.parse(body);
    // A byte-order mark makes browsers display plain text as UTF-8; JSON is UTF-8 by definition and must not have one.
    const parts = tool.json ? [body] : ["\uFEFF", body];
    const originalSize = body !== text ? new Blob([text]).size : undefined;
    return { blob: new Blob(parts, { type: tool.textType }), type: tool.textType, name: `${tool.json ? "data" : "text"}-${stamp()}.${tool.extension}`, originalSize };
  };
  const describeError = (cause: unknown) => (cause instanceof SyntaxError ? `Invalid JSON: ${cause.message}` : cause instanceof Error ? cause.message : String(cause));

  let meta: { text: string; ok: boolean } | null = null;
  if (tool.mode !== "file" && text.trim()) {
    try {
      const { blob, type, originalSize } = encodeText();
      meta = { ok: true, text: `${originalSize ? `${formatBytes(originalSize)} → ` : ""}${formatBytes(blob.size)}${tool.mode === "base64" ? ` · ${type}` : tool.json ? " · valid JSON" : ` · ${text.length.toLocaleString()} characters`}` };
    } catch (cause) {
      meta = { ok: false, text: describeError(cause) };
    }
  }

  const submitText = () => {
    setError("");
    try {
      const job = encodeText();
      if (job.blob.size > settings.maxBytes) throw new Error(`This is ${formatBytes(job.blob.size)}. The limit is ${formatBytes(settings.maxBytes)}.`);
      enqueue([job]);
      setText("");
    } catch (cause) {
      setError(describeError(cause));
    }
  };

  const clearList = () => {
    store.set(HISTORY_KEY, []);
    setItems((list) => {
      for (const item of list) if (item.preview && item.state !== "uploading" && item.state !== "waiting") URL.revokeObjectURL(item.preview);
      return list.filter((item) => item.state === "waiting" || item.state === "compressing" || item.state === "uploading");
    });
  };

  return (
    <div id="uploader" className="ph-no-capture ph-mask">
      {tool.mode === "file" ? (
        <div>
          <input
            id="file-input" className="visually-hidden" type="file" multiple accept={tool.picker || undefined}
            onChange={(event) => { addFiles([...(event.target.files || [])]); event.target.value = ""; }}
          />
          <label
            htmlFor="file-input" className={`dropzone${over ? " is-over" : ""}`}
            onDragEnter={(event) => { event.preventDefault(); setOver(true); }}
            onDragOver={(event) => { event.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(event) => { event.preventDefault(); setOver(false); addFiles([...event.dataTransfer.files]); }}
          >
            <span className="dropzone-icon"><Icon name={tool.pasteFirst ? "screenshot" : "upload"} size={30} /></span>
            <strong>{tool.pasteFirst ? "Paste a screenshot with Ctrl+V" : `Drop ${tool.label} here`}</strong>
            <span>{tool.pasteFirst ? "or drop an image, or " : "or "}<u>browse your device</u>{tool.pasteFirst ? "" : " · paste with Ctrl+V"}</span>
            <small>{tool.formats} · up to {formatBytes(settings.maxBytes)} each</small>
          </label>
        </div>
      ) : (
        <div className="text-box">
          <textarea
            className="text-input" rows={9} spellCheck={false} placeholder={tool.placeholder} value={text}
            aria-label={tool.mode === "base64" ? "Base64 data" : `${tool.name} content`}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="text-actions">
            <span className={`text-meta${meta ? (meta.ok ? " is-ok" : " is-bad") : ""}`}>{meta?.text}</span>
            {tool.json && (
              <button type="button" className="button button-ghost" onClick={() => { try { setText(JSON.stringify(JSON.parse(text), null, 2)); } catch { /* shown in meta */ } }}>
                Format
              </button>
            )}
            <button type="button" className="button" onClick={submitText}><Icon name="link" size={18} /> Create link</button>
          </div>
        </div>
      )}

      <fieldset className="lifetime">
        <legend>Keep link for</legend>
        <div className="segmented">
          {settings.lifetimes.map((entry) => (
            <label key={entry.days}>
              <input
                type="radio" name="lifetime" value={entry.days} checked={entry.days === lifetime}
                onChange={() => { setLifetime(entry.days); store.set(LIFETIME_KEY, entry.days); }}
              />
              <span>{entry.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {reducible && (
        <label className="reduce">
          <input type="checkbox" checked={compress} onChange={(event) => { setCompress(event.target.checked); store.set(COMPRESS_KEY, event.target.checked); }} />
          <span className="switch" aria-hidden="true" />
          <span>
            <strong>{tool.json ? "Minify JSON" : "Reduce image size"}</strong>
            <small>{tool.json
              ? "Removes spaces and line breaks. The data itself is unchanged."
              : `Resizes to ${(tool.pasteFirst ? PRESETS.screenshot : PRESETS.photo).maxDimension}px max, saves as WebP, and removes photo metadata such as location. GIFs and animations stay untouched.`}</small>
          </span>
        </label>
      )}

      {error && <p className="alert" role="alert">{error}</p>}

      {items.length > 0 && (
        <div className="links-head">
          <h3>Your links</h3>
          <button type="button" className="text-button" onClick={clearList}><Icon name="trash" size={14} /> Clear list</button>
        </div>
      )}
      <ul className="links" aria-live="polite">
        {items.map((item) => <LinkItem key={item.id} item={item} />)}
      </ul>
    </div>
  );
}

function LinkItem({ item }: { item: Item }) {
  const [copied, setCopied] = useState(false);
  const percent = Math.round(item.progress * 100);
  const saved = item.originalSize && item.originalSize > item.size
    ? `${formatBytes(item.originalSize)} → ${formatBytes(item.size)} · ${Math.round((1 - item.size / item.originalSize) * 100)}% smaller` : "";
  const low = typeof item.remaining === "number" && item.remaining < 4
    ? ` · ${item.remaining} upload${item.remaining === 1 ? "" : "s"} left for now` : "";
  return (
    <li className={`link is-${item.state}`}>
      <span className="link-thumb">
        {/* Local object-URL preview of the user's own file; next/image does not apply. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {item.preview ? <img src={item.preview} alt="" /> : <Icon name={typeIcon(item.type || "")} size={22} />}
      </span>
      <div className="link-main">
        <div className="link-title">
          <strong>{item.name}</strong>
          {saved ? <span className="saved">{saved}</span> : <span>{formatBytes(item.size)}</span>}
        </div>
        {(item.state === "waiting" || item.state === "compressing" || item.state === "uploading") && (
          <div className="link-progress">
            <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={`Uploading ${item.name}`}>
              <span style={{ width: `${percent}%` }} />
            </div>
            <small>{item.state === "waiting" ? "Waiting…" : item.state === "compressing" ? "Reducing size…" : `Uploading… ${percent}%`}</small>
          </div>
        )}
        {item.state === "error" && <p className="link-error">{item.error}</p>}
        {item.state === "done" && item.url && (
          <div>
            <div className="link-row">
              <input className="link-url" value={item.url} readOnly aria-label={`Link for ${item.name}`} onFocus={(event) => event.target.select()} />
              <button type="button" className="icon-button primary" onClick={async () => { await copyText(item.url); setCopied(true); setTimeout(() => setCopied(false), 1600); }}>
                <Icon name={copied ? "check" : "copy"} size={16} /> {copied ? "Copied" : "Copy"}
              </button>
              <a className="icon-button" href={item.url} target="_blank" rel="noopener noreferrer"><Icon name="external" size={16} /> Open</a>
            </div>
            <small className="link-expiry">
              <Icon name="clock" size={13} /> Deletes {timeLeft(item.deletesAt)} · {new Date(item.deletesAt * 1000).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}{low}
            </small>
          </div>
        )}
      </div>
    </li>
  );
}

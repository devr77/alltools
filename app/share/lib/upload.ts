/**
 * Upload client for the ToolsBase uploads API.
 * Step 1: POST /v1/uploads with { contentType, size, expiresIn, deleteAfterDays } returns a presigned PUT URL
 *         (valid for `expiresIn` seconds) and the public URL the file will be served from.
 * Step 2: PUT the bytes to that URL with the returned headers. The public URL works until `deletesAt`.
 * Everything above `createUpload` is pure and covered by tests/upload.test.mjs.
 */

const EXTENSION_TYPES = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", avif: "image/avif",
  bmp: "image/bmp", ico: "image/x-icon", heic: "image/heic", heif: "image/heif", tif: "image/tiff", tiff: "image/tiff",
  mp4: "video/mp4", m4v: "video/mp4", mov: "video/quicktime", webm: "video/webm", mkv: "video/x-matroska", avi: "video/x-msvideo",
  mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/mp4", aac: "audio/aac", ogg: "audio/ogg", oga: "audio/ogg", opus: "audio/ogg", flac: "audio/flac",
  pdf: "application/pdf", json: "application/json", txt: "text/plain", md: "text/plain", csv: "text/csv", log: "text/plain",
  doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text", ods: "application/vnd.oasis.opendocument.spreadsheet", odp: "application/vnd.oasis.opendocument.presentation",
  rtf: "application/rtf", epub: "application/epub+zip",
  zip: "application/zip", "7z": "application/x-7z-compressed", rar: "application/vnd.rar", gz: "application/gzip", tgz: "application/gzip", tar: "application/x-tar",
};

const TYPE_EXTENSIONS = Object.fromEntries(Object.entries(EXTENSION_TYPES).reverse().map(([ext, type]) => [type, ext]));
Object.assign(TYPE_EXTENSIONS, { "image/jpeg": "jpg", "video/mp4": "mp4", "text/plain": "txt", "audio/ogg": "ogg", "application/gzip": "gz" });

/**
 * Types a browser would render as an active document (scripts run on the content domain).
 * They are uploaded as application/octet-stream, so opening the link downloads the file instead.
 */
const ACTIVE_TYPES = new Set([
  "text/html", "application/xhtml+xml", "image/svg+xml", "text/xml", "application/xml",
  "text/javascript", "application/javascript", "application/x-javascript", "application/ecmascript", "text/ecmascript",
  "application/x-shockwave-flash", "text/xsl", "application/xslt+xml", "multipart/x-mixed-replace",
]);
const ACTIVE_EXTENSIONS = new Set(["html", "htm", "xhtml", "shtml", "svg", "svgz", "xml", "xsl", "xslt", "js", "mjs", "swf"]);

export function extensionOf(name) {
  const match = /\.([a-z0-9]{1,8})$/i.exec(String(name || ""));
  return match ? match[1].toLowerCase() : "";
}

export function extensionForType(type) {
  return TYPE_EXTENSIONS[String(type).split(";")[0].trim().toLowerCase()] || "bin";
}

/** The Content-Type to register and send for a file: its browser type, else its extension, else binary. */
export function resolveContentType(name, browserType) {
  const declared = String(browserType || "").split(";")[0].trim().toLowerCase();
  const ext = extensionOf(name);
  if (ACTIVE_TYPES.has(declared) || ACTIVE_EXTENSIONS.has(ext)) return "application/octet-stream";
  if (/^[a-z]+\/[a-z0-9.+-]+$/.test(declared)) return declared;
  return EXTENSION_TYPES[ext] || "application/octet-stream";
}

/**
 * Whether a file matches a tool's accept rules: { types: ["image/"], extensions: ["pdf"] } (empty = anything).
 * Type prefixes ending in "/" match a whole family.
 */
export function matchesAccept(name, contentType, accept) {
  if (!accept || (!accept.types?.length && !accept.extensions?.length)) return true;
  const ext = extensionOf(name);
  if (accept.extensions?.includes(ext)) return true;
  return (accept.types || []).some((rule) => (rule.endsWith("/") ? contentType.startsWith(rule) : contentType === rule));
}

/** Returns an error message for a file that cannot be uploaded, or null. */
export function validateFile({ name, size, type }, { accept, maxBytes, label }) {
  if (!size) return `“${name}” is empty.`;
  if (maxBytes && size > maxBytes) return `“${name}” is ${formatBytes(size)}. The limit is ${formatBytes(maxBytes)} per file.`;
  if (!matchesAccept(name, resolveContentType(name, type), accept)) return `“${name}” is not ${label || "a supported file"}.`;
  return null;
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1000) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = -1;
  do { value /= 1000; unit += 1; } while (value >= 1000 && unit < units.length - 1);
  return `${value >= 100 ? Math.round(value) : Number(value.toFixed(1))} ${units[unit]}`;
}

/** "in 23 hours", "in 6 days": time left until a Unix timestamp in seconds. */
export function timeLeft(deletesAt, now = Date.now()) {
  const seconds = deletesAt - now / 1000;
  if (seconds <= 0) return "expired";
  const hours = seconds / 3600;
  if (hours < 1) return `in ${Math.max(1, Math.round(seconds / 60))} min`;
  if (hours < 36) return `in ${Math.round(hours)} hour${Math.round(hours) === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `in ${days} days`;
}

const MAGIC: [number[], string][] = [
  [[0x89, 0x50, 0x4e, 0x47], "image/png"],
  [[0xff, 0xd8, 0xff], "image/jpeg"],
  [[0x47, 0x49, 0x46, 0x38], "image/gif"],
  [[0x25, 0x50, 0x44, 0x46], "application/pdf"],
  [[0x50, 0x4b, 0x03, 0x04], "application/zip"],
  [[0x49, 0x44, 0x33], "audio/mpeg"],
  [[0x1a, 0x45, 0xdf, 0xa3], "video/webm"],
  [[0x42, 0x4d], "image/bmp"],
];

/** Best-effort type detection from leading bytes, for Base64 input without a data: prefix. */
export function sniffType(bytes) {
  for (const [signature, type] of MAGIC) {
    if (signature.every((byte, index) => bytes[index] === byte)) return type;
  }
  const ascii = (start, text) => [...text].every((char, index) => bytes[start + index] === char.charCodeAt(0));
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "image/webp";
  if (ascii(0, "RIFF") && ascii(8, "WAVE")) return "audio/wav";
  if (ascii(4, "ftyp")) return ascii(8, "avif") ? "image/avif" : ascii(8, "qt  ") ? "video/quicktime" : "video/mp4";
  if (ascii(0, "OggS")) return "audio/ogg";
  return "application/octet-stream";
}

/**
 * Decode pasted Base64: raw, URL-safe, wrapped across lines, or a data: URI.
 * Returns { bytes: Uint8Array, contentType }. Throws with a readable message on invalid input.
 */
export function decodeBase64Input(input) {
  let text = String(input || "").trim();
  let declared = "";
  const dataUri = /^data:([^;,]*)((?:;[^;,]*)*?);base64,/i.exec(text);
  if (dataUri) {
    declared = dataUri[1].toLowerCase();
    text = text.slice(dataUri[0].length);
  } else if (/^data:/i.test(text)) {
    throw new Error("Only Base64 data URIs are supported (data:<type>;base64,…).");
  }
  text = text.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  if (!text) throw new Error("Paste some Base64 data first.");
  if (!/^[A-Za-z0-9+/]+$/.test(text) || text.length % 4 === 1) throw new Error("This is not valid Base64. Check for missing or extra characters.");
  const binary = atob(text + "=".repeat((4 - (text.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const contentType = declared && declared !== "application/octet-stream" ? declared : sniffType(bytes);
  return { bytes, contentType: resolveContentType(`file.${extensionForType(contentType)}`, contentType) };
}

/** A readable message from an API error body ({ error: { message } }, { error }, { message }) and status. */
export function apiErrorMessage(status, body) {
  const detail = typeof body?.error === "string" ? body.error : body?.error?.message || body?.message;
  if (status === 429) return "Upload limit reached for now. Please wait a little and try again.";
  if (status === 413) return detail || "This file is larger than the upload service allows.";
  if (detail) return String(detail);
  return status >= 500 ? "The upload service is having trouble. Please try again shortly." : `The upload was rejected (HTTP ${status}).`;
}

/* ---------- Network (browser only) ---------- */

const UNREACHABLE = "Could not reach the upload service. Check your connection, or disable extensions that block requests, then try again.";

/** Step 1: reserve an upload slot. Resolves to the API's `data` object plus the remaining rate limit. */
export async function createUpload(api: string, { contentType, size, deleteAfterDays, expiresIn }: { contentType: string; size: number; deleteAfterDays: number; expiresIn: number }): Promise<UploadSlot> {
  let response;
  try {
    response = await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType, size, expiresIn, deleteAfterDays }),
    });
  } catch {
    throw new Error(UNREACHABLE);
  }
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.data?.url) throw new Error(apiErrorMessage(response.status, body));
  const remaining = Number(response.headers.get("X-RateLimit-Remaining"));
  return { ...body.data, remaining: Number.isFinite(remaining) && response.headers.has("X-RateLimit-Remaining") ? remaining : null };
}

/** Step 2: send the bytes to the presigned URL. XHR (not fetch) so upload progress can be reported. */
type UploadSlot = { url: string; method?: string; headers?: Record<string, string>; publicUrl: string; deletesAt: number; remaining: number | null };
type ProgressOptions = { onProgress?: (fraction: number) => void; signal?: AbortSignal };

export function putFile(slot: UploadSlot, blob: Blob, { onProgress, signal }: ProgressOptions = {}) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(slot.method || "PUT", slot.url);
    // Content-Length and Host are set by the browser (and are forbidden to set manually).
    for (const [name, value] of Object.entries(slot.headers || {})) {
      if (!/^(content-length|host)$/i.test(name)) xhr.setRequestHeader(name, String(value));
    }
    xhr.upload.onprogress = (event) => event.lengthComputable && onProgress?.(event.loaded / event.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Storage rejected the file (HTTP ${xhr.status}). Please try again.`)));
    xhr.onerror = () => reject(new Error(UNREACHABLE));
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(blob);
  });
}

/** Full flow for one Blob. Resolves to { publicUrl, deletesAt, remaining, ... }. */
export async function uploadBlob(
  api: string, blob: Blob,
  { contentType, deleteAfterDays, expiresIn = 300, onProgress, signal }: { contentType: string; deleteAfterDays: number; expiresIn?: number } & ProgressOptions,
): Promise<UploadSlot> {
  const slot = await createUpload(api, { contentType, size: blob.size, deleteAfterDays, expiresIn });
  await putFile(slot, blob, { onProgress, signal });
  return slot;
}

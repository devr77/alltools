/** Browser-only BitTorrent v1 utilities. No trackers are contacted and no files are uploaded. */
export type BValue = number | string | Uint8Array | BValue[] | { [key: string]: BValue };
type BDictionary = { [key: string]: BValue };
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });
export const MAX_TORRENT_BYTES = 10 * 1024 * 1024;
export const MAX_CONTENT_BYTES = 1024 * 1024 * 1024;
export const MAX_FILES = 1000;

function join(chunks: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const result = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}

function compareBytes(a: Uint8Array, b: Uint8Array) {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
}

export function bencode(value: BValue): Uint8Array<ArrayBuffer> {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) throw new Error("Bencode integers must be safe whole numbers.");
    return encoder.encode(`i${value}e`);
  }
  if (typeof value === "string" || value instanceof Uint8Array) {
    const bytes = typeof value === "string" ? encoder.encode(value) : value;
    return join([encoder.encode(`${bytes.length}:`), bytes]);
  }
  if (Array.isArray(value)) return join([encoder.encode("l"), ...value.map(bencode), encoder.encode("e")]);
  const keys = Object.keys(value).sort((a, b) => compareBytes(encoder.encode(a), encoder.encode(b)));
  return join([encoder.encode("d"), ...keys.flatMap((key) => [bencode(key), bencode(value[key])]), encoder.encode("e")]);
}

/** Retains the exact info byte range: an info hash must never hash the whole torrent file. */
function decodeTorrent(bytes: Uint8Array) {
  if (!bytes.length || bytes.length > MAX_TORRENT_BYTES) throw new Error("Choose a non-empty .torrent file up to 10 MiB.");
  let offset = 0;
  let nodes = 0;
  let infoBytes: Uint8Array;

  function parse(depth = 0): BValue {
    if (depth > 64 || ++nodes > 200000) throw new Error("Torrent metadata is too complex.");
    const tag = bytes[offset++];
    if (tag === 105) {
      const end = bytes.indexOf(101, offset);
      if (end < 0 || end - offset > 17) throw new Error("Invalid bencode integer.");
      const text = decoder.decode(bytes.subarray(offset, end));
      const value = Number(text);
      if (!/^(0|-?[1-9]\d*)$/.test(text) || !Number.isSafeInteger(value)) throw new Error("Invalid or unsupported bencode integer.");
      offset = end + 1;
      return value;
    }
    if (tag === 108 || tag === 100) {
      const list: BValue[] = [];
      const dict: BDictionary = Object.create(null);
      let previousKey: Uint8Array | undefined;
      while (offset < bytes.length && bytes[offset] !== 101) {
        if (tag === 108) { list.push(parse(depth + 1)); continue; }
        const keyBytes = parse(depth + 1);
        if (!(keyBytes instanceof Uint8Array)) throw new Error("Dictionary keys must be byte strings.");
        if (previousKey && compareBytes(previousKey, keyBytes) >= 0) throw new Error("Torrent dictionary keys must be sorted and unique.");
        previousKey = keyBytes;
        const key = decoder.decode(keyBytes);
        const start = offset;
        dict[key] = parse(depth + 1);
        if (depth === 0 && key === "info") infoBytes = bytes.subarray(start, offset);
      }
      if (bytes[offset++] !== 101) throw new Error("Truncated bencode container.");
      return tag === 108 ? list : dict;
    }
    if (tag >= 48 && tag <= 57) {
      const start = offset - 1;
      const colon = bytes.indexOf(58, start);
      if (colon < 0 || colon - start > 10) throw new Error("Invalid byte string length.");
      const text = decoder.decode(bytes.subarray(start, colon));
      if (!/^(0|[1-9]\d*)$/.test(text)) throw new Error("Invalid byte string length.");
      const length = Number(text);
      offset = colon + 1 + length;
      if (offset > bytes.length) throw new Error("Truncated byte string.");
      return bytes.subarray(colon + 1, offset);
    }
    throw new Error("This is not a valid bencoded torrent file.");
  }

  const root = dictionary(parse(), "Torrent");
  if (offset !== bytes.length) throw new Error("Unexpected data after torrent metadata.");
  if (!infoBytes) throw new Error("Torrent is missing its info dictionary.");
  return { root, infoBytes };
}

function dictionary(value: BValue, label: string): BDictionary {
  if (!value || typeof value !== "object" || Array.isArray(value) || value instanceof Uint8Array) {
    throw new Error(`${label} must be a dictionary.`);
  }
  return value;
}
function text(value: BValue, fallback = ""): string {
  return value instanceof Uint8Array ? decoder.decode(value) : typeof value === "string" ? value : fallback;
}
function nonnegative(value: BValue, label: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative whole number.`);
  return value;
}
function safeName(name: string) {
  if (!name.trim() || name === "." || name === ".." || /[\\/\x00-\x1f\x7f]/.test(name)) throw new Error("File and folder names must be non-empty and cannot contain slashes or control characters.");
  return name;
}
async function sha1(bytes: Uint8Array): Promise<Uint8Array<ArrayBuffer>> {
  if (!globalThis.crypto?.subtle) throw new Error("Hashing requires a browser with Web Crypto on HTTPS or localhost.");
  return new Uint8Array(await crypto.subtle.digest("SHA-1", new Uint8Array(bytes)));
}
function hex(bytes: Uint8Array) { return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(""); }
export function toBase32(hash: string): string {
  const bytes = normalizeInfoHash(hash).match(/../g).map((pair) => parseInt(pair, 16));
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0, buffer = 0, result = "";
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte; bits += 8;
    while (bits >= 5) { bits -= 5; result += alphabet[(buffer >>> bits) & 31]; }
  }
  return result;
}
export function normalizeInfoHash(input: string): string {
  const value = input.trim().replace(/^urn:btih:/i, "");
  if (/^[a-f\d]{40}$/i.test(value)) return value.toLowerCase();
  if (/^[a-z2-7]{32}$/i.test(value)) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let buffer = 0, bits = 0;
    const bytes: number[] = [];
    for (const char of value.toUpperCase()) {
      buffer = (buffer << 5) | alphabet.indexOf(char); bits += 5;
      if (bits >= 8) { bits -= 8; bytes.push((buffer >>> bits) & 255); }
    }
    return hex(new Uint8Array(bytes));
  }
  throw new Error("Enter a 40-character hexadecimal or 32-character Base32 BitTorrent v1 info hash.");
}
export function parseTrackers(input: string): string[] {
  const trackers = [...new Set(input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))];
  if (trackers.length > 50) throw new Error("Use up to 50 tracker URLs.");
  for (const tracker of trackers) {
    let url: URL;
    try { url = new URL(tracker); } catch { throw new Error(`Invalid tracker URL: ${tracker}`); }
    if (!["https:", "http:", "udp:", "wss:", "ws:"].includes(url.protocol) || !url.hostname || url.username || url.password) {
      throw new Error("Trackers must be HTTP(S), UDP, or WS(S) URLs without login credentials.");
    }
  }
  return trackers;
}
export function makeMagnet(hash: string, name = "", trackers: string[] = []): string {
  const infoHash = normalizeInfoHash(hash);
  const parts = [`xt=urn:btih:${infoHash}`];
  if (name.trim()) parts.push(`dn=${encodeURIComponent(name.trim())}`);
  for (const tracker of parseTrackers(trackers.join("\n"))) parts.push(`tr=${encodeURIComponent(tracker)}`);
  return `magnet:?${parts.join("&")}`;
}
export function extractMagnet(input: string) {
  let url: URL;
  try { url = new URL(input.trim()); } catch { throw new Error("Enter a valid magnet link beginning with magnet:?."); }
  if (url.protocol !== "magnet:") throw new Error("Enter a magnet link beginning with magnet:?.");
  const hashes = url.searchParams.getAll("xt").filter((value) => /^urn:btih:/i.test(value)).map(normalizeInfoHash);
  if (!hashes.length) throw new Error("No BitTorrent v1 (urn:btih) hash found. V2-only magnet links are not supported.");
  if (new Set(hashes).size !== 1) throw new Error("This magnet contains conflicting BitTorrent v1 hashes.");
  return { infoHash: hashes[0], base32: toBase32(hashes[0]), name: url.searchParams.get("dn") || "", trackers: parseTrackers(url.searchParams.getAll("tr").join("\n")) };
}

export interface TorrentSummary {
  name: string;
  infoHash: string;
  base32: string;
  magnet: string;
  totalSize: number;
  pieceLength: number;
  pieceCount: number;
  files: { path: string; length: number }[];
  trackers: string[];
  private: boolean;
  comment: string;
  createdBy: string;
  creationDate: string | null;
}
export async function inspectTorrent(bytes: Uint8Array): Promise<TorrentSummary> {
  const { root, infoBytes } = decodeTorrent(bytes);
  const info = dictionary(root.info, "Info");
  if (!(info.pieces instanceof Uint8Array)) throw new Error("This file has no v1 piece hashes. V2-only torrents are not supported.");
  if (info.pieces.length % 20) throw new Error("Piece hashes must be a multiple of 20 bytes.");
  const pieceLength = nonnegative(info["piece length"], "Piece length");
  if (pieceLength === 0) throw new Error("Piece length must be greater than zero.");
  const name = safeName(text(info.name));
  if ((info.length !== undefined) === (info.files !== undefined)) throw new Error("Torrent must contain either a length or a file list.");
  const files: TorrentSummary["files"] = [];
  if (info.length !== undefined) files.push({ path: name, length: nonnegative(info.length, "File length") });
  else {
    if (!Array.isArray(info.files) || !info.files.length) throw new Error("Torrent file list is empty or invalid.");
    for (const entry of info.files) {
      const file = dictionary(entry, "File");
      if (!Array.isArray(file.path) || !file.path.length) throw new Error("File path is missing.");
      files.push({ path: [name, ...file.path.map((part) => safeName(text(part)))].join("/"), length: nonnegative(file.length, "File length") });
    }
  }
  if (new Set(files.map((file) => file.path)).size !== files.length) throw new Error("Torrent contains duplicate file paths.");
  const totalSize = files.reduce((sum, file) => sum + file.length, 0);
  if (!Number.isSafeInteger(totalSize)) throw new Error("Torrent total size exceeds the supported integer range.");
  const pieceCount = info.pieces.length / 20;
  if (pieceCount !== Math.ceil(totalSize / pieceLength)) throw new Error("Piece hash count does not match the declared content size.");
  const announceList = Array.isArray(root["announce-list"]) ? root["announce-list"].flatMap((tier) => Array.isArray(tier) ? tier.map((entry) => text(entry)) : [text(tier)]) : [];
  const trackers = parseTrackers([text(root.announce), ...announceList].filter(Boolean).join("\n"));
  const infoHash = hex(await sha1(infoBytes));
  const date = typeof root["creation date"] === "number" ? new Date(root["creation date"] * 1000) : null;
  return {
    name, infoHash, base32: toBase32(infoHash), magnet: makeMagnet(infoHash, name, trackers),
    totalSize, pieceLength, pieceCount, files, trackers,
    private: info.private === 1, comment: text(root.comment), createdBy: text(root["created by"]),
    creationDate: date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
  };
}

export interface CreateTorrentOptions {
  name?: string;
  trackers?: string[];
  pieceLength?: number;
  comment?: string;
  private?: boolean;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}
export async function createTorrent(files: File[], options: CreateTorrentOptions = {}) {
  if (!files.length || files.length > MAX_FILES) throw new Error("Choose between 1 and 1,000 files.");
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > MAX_CONTENT_BYTES) throw new Error("Select up to 1 GiB of content per torrent.");
  const pieceLength = options.pieceLength ?? 256 * 1024;
  if (!Number.isInteger(pieceLength) || pieceLength < 16384 || pieceLength > 16 * 1024 * 1024 || (pieceLength & (pieceLength - 1)) !== 0) throw new Error("Choose a power-of-two piece size between 16 KiB and 16 MiB.");
  const trackers = parseTrackers((options.trackers || []).join("\n"));
  if (options.private && !trackers.length) throw new Error("A private torrent needs at least one tracker URL.");
  const names = files.map((file) => safeName(file.name));
  if (new Set(names).size !== names.length) throw new Error("Selected files have duplicate names. Rename them before creating a torrent.");
  const name = safeName(options.name?.trim() || (files.length === 1 ? names[0] : "my-files"));
  const hashes: Uint8Array[] = [];
  const piece = new Uint8Array(pieceLength);
  let used = 0, processed = 0;
  options.onProgress?.(0);
  const checkCanceled = () => { if (options.signal?.aborted) throw new Error("Torrent creation canceled."); };
  // Keep partial pieces between files, as v1 treats multi-file content as one byte stream.
  for (const file of files) {
    let offset = 0;
    while (offset < file.size) {
      checkCanceled();
      const length = Math.min(pieceLength - used, file.size - offset);
      const chunk = new Uint8Array(await file.slice(offset, offset + length).arrayBuffer());
      if (chunk.length !== length) throw new Error("A selected file could not be read completely.");
      piece.set(chunk, used);
      used += length; offset += length; processed += length;
      if (used === pieceLength) { hashes.push(await sha1(piece)); used = 0; }
      options.onProgress?.(Math.floor(processed / Math.max(totalSize, 1) * 100));
    }
  }
  checkCanceled();
  if (used) hashes.push(await sha1(piece.subarray(0, used)));
  const info: BDictionary = { name, "piece length": pieceLength, pieces: join(hashes) };
  if (files.length === 1) info.length = totalSize;
  else info.files = files.map((file, index) => ({ length: file.size, path: [names[index]] }));
  if (options.private) info.private = 1;
  const root: BDictionary = { info, "created by": "ToolsBase", "creation date": Math.floor(Date.now() / 1000) };
  if (trackers.length) { root.announce = trackers[0]; root["announce-list"] = trackers.map((tracker) => [tracker]); }
  if (options.comment?.trim()) root.comment = options.comment.trim();
  const bytes = bencode(root);
  const summary = await inspectTorrent(bytes);
  checkCanceled();
  options.onProgress?.(100);
  return { bytes, summary };
}
export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";
  const unit = Math.max(0, Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 4));
  return `${(bytes / 1024 ** unit).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${["B", "KiB", "MiB", "GiB", "TiB"][unit]}`;
}

/**
 * Browser-side HLS fetching: playlists, segments (with byte ranges and retries), AES-128 decryption, and the
 * download engine that fetches segments in parallel but writes them in order.
 * Everything runs in the visitor's browser, so the stream's server must allow cross-origin reads (CORS).
 */
import { ivFor, parsePlaylist, SUPPORTED_KEY_METHODS, type InitMap, type MediaPlaylist, type Segment } from "./m3u8";
import { createAssembler, sniffContainer, type Format } from "./remux";

type Bytes = Uint8Array<ArrayBuffer>;

/** Checks a pasted address before any request, so mistakes get a specific message. */
export function checkStreamUrl(input: string): string {
  const value = input.trim();
  if (!value) throw new Error("Paste the address of an .m3u8 playlist.");
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("That isn't a full web address. It should start with https://"); }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only http:// and https:// playlist addresses are supported.");
  if (url.protocol === "http:" && typeof location !== "undefined" && location.protocol === "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) {
    throw new Error("Browsers block insecure http:// streams on secure pages. Try the same address with https:// instead.");
  }
  return url.href;
}

function httpError(status: number, what: string) {
  if (status === 401 || status === 403) return new Error(`The server refused access to the ${what} (HTTP ${status}). The link may have expired, or it only works on the site it came from. Copy a fresh address and try again.`);
  if (status === 404 || status === 410) return new Error(`The ${what} wasn't found (HTTP ${status}). The link may have expired.`);
  if (status === 429) return new Error(`The server is rate-limiting requests for the ${what} (HTTP 429). Wait a minute and try again.`);
  return new Error(`The server returned HTTP ${status} for the ${what}.`);
}

const blockedMessage = (what: string) => `Couldn't read the ${what}. The server doesn't allow other websites to load it (CORS), the address is wrong, or you're offline. Streams that only play on their own website can't be loaded here.`;

const retryable = (status: number) => status === 408 || status === 429 || status >= 500;
const pause = (ms: number, signal?: AbortSignal) => new Promise<void>((done, fail) => {
  const timer = setTimeout(done, ms);
  signal?.addEventListener("abort", () => { clearTimeout(timer); fail(signal.reason); }, { once: true });
});

/** GET with up to three attempts for network errors and 408/429/5xx. Byte ranges use a Range header. */
async function request(url: string, what: string, signal?: AbortSignal, range?: { offset: number; length: number }): Promise<Response> {
  const headers = range ? { Range: `bytes=${range.offset}-${range.offset + range.length - 1}` } : undefined;
  for (let attempt = 1; ; attempt++) {
    let response: Response;
    try {
      response = await fetch(url, { signal, headers, credentials: "omit" });
    } catch (cause) {
      if (signal?.aborted) throw signal.reason;
      if (attempt < 3) { await pause(600 * attempt, signal); continue; }
      throw new Error(blockedMessage(what), { cause });
    }
    if (response.ok) return response;
    if (attempt < 3 && retryable(response.status)) { await pause(800 * attempt, signal); continue; }
    throw httpError(response.status, what);
  }
}

/** Fetches and parses a playlist. The final URL (after redirects) is the base for its relative links. */
export async function loadPlaylist(input: string, signal?: AbortSignal) {
  const url = checkStreamUrl(input);
  const response = await request(url, "playlist", signal);
  const text = await response.text();
  return { text, playlist: parsePlaylist(text, response.url || url) };
}

async function readRange(response: Response, range?: { offset: number; length: number }): Promise<Bytes> {
  const bytes = new Uint8Array(await response.arrayBuffer());
  // A server that ignores Range sends the whole file with 200; cut the requested part out of it.
  return range && response.status === 200 && bytes.byteLength > range.length ? bytes.slice(range.offset, range.offset + range.length) : bytes;
}

export type DownloadProgress = { done: number; total: number; bytes: number; seconds: number };

export type DownloadResult = { blob: Blob; extension: string; warnings: string[] };

const mapKey = (map?: InitMap) => (map ? `${map.uri}|${map.byteRange?.offset ?? ""}` : "");

/**
 * Downloads every segment of a media playlist and joins them into one file. Segments are fetched `concurrency` at a
 * time but written strictly in order; at most a few windows' worth wait in memory. Rejects on the first segment that
 * still fails after retries, or with the signal's reason when cancelled.
 */
export async function downloadStream(playlist: MediaPlaylist, options: {
  format: Format; signal: AbortSignal; onProgress: (progress: DownloadProgress) => void; concurrency?: number;
}): Promise<DownloadResult> {
  const segments = playlist.segments.filter((segment) => !segment.gap);
  if (!segments.length) throw new Error("This playlist has no segments to download.");
  const drm = segments.find((segment) => segment.key && !SUPPORTED_KEY_METHODS.includes(segment.key.method));
  if (drm) throw new Error(`This stream is protected with ${drm.key.method} encryption (DRM). Protected streams can't be downloaded.`);
  const keyless = segments.find((segment) => segment.key && !segment.key.uri);
  if (keyless) throw new Error("The playlist declares AES-128 encryption without a key address, so the segments can't be decrypted.");

  const warnings: string[] = [];
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 6, 10));
  const window = concurrency * 3;
  const controller = new AbortController();
  const stop = () => controller.abort(options.signal.reason);
  options.signal.addEventListener("abort", stop, { once: true });
  const signal = controller.signal;

  // Shared fetches: one request per key and per init section, however many segments use them.
  const keys = new Map<string, Promise<CryptoKey>>();
  const inits = new Map<string, Promise<Bytes>>();
  const key = (uri: string) => {
    if (!keys.has(uri)) {
      keys.set(uri, request(uri, "decryption key", signal).then(readRange).then((raw) => {
        if (raw.byteLength !== 16) throw new Error(`The decryption key should be 16 bytes but is ${raw.byteLength}. The key URL may need the original site's login.`);
        return crypto.subtle.importKey("raw", raw, "AES-CBC", false, ["decrypt"]);
      }));
    }
    return keys.get(uri);
  };
  const init = (map: InitMap) => {
    const id = mapKey(map);
    if (!inits.has(id)) inits.set(id, request(map.uri, "init segment", signal, map.byteRange).then((response) => readRange(response, map.byteRange)));
    return inits.get(id);
  };

  async function fetchSegment(segment: Segment, index: number): Promise<Bytes> {
    const response = await request(segment.uri, `segment ${index + 1}`, signal, segment.byteRange);
    let bytes = await readRange(response, segment.byteRange);
    if (segment.key) {
      try {
        bytes = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-CBC", iv: ivFor(segment) }, await key(segment.key.uri), bytes));
      } catch (cause) {
        if (signal.aborted) throw signal.reason;
        if (cause instanceof Error && cause.message.includes("decryption key")) throw cause;
        throw new Error(`Segment ${index + 1} couldn't be decrypted. The key may be wrong or tied to the original site.`, { cause });
      }
    }
    return bytes;
  }

  const mux = options.format === "mp4" ? (await import("mux.js")).default : null;
  const extensionFromUrl = (/\.([a-z0-9]{2,4})(?:[?#]|$)/i.exec(segments[0].uri)?.[1] || "bin").toLowerCase();
  let assembler: ReturnType<typeof createAssembler> | null = null;
  let writtenInit = "";
  let elapsed = 0;
  let written = 0;
  let nextIndex = 0;
  let bytes = 0;
  const ready = new Map<number, { data: Bytes; init?: Bytes }>();
  let waiting: (() => void)[] = [];
  const wake = () => waiting.splice(0).forEach((resume) => resume());
  signal.addEventListener("abort", wake, { once: true });

  // Writes every segment that is next in line. Runs synchronously, so writes never interleave.
  const drain = () => {
    while (ready.has(written)) {
      const { data, init: initBytes } = ready.get(written);
      ready.delete(written);
      const segment = segments[written];
      if (!assembler) {
        const container = initBytes ? "fmp4" : sniffContainer(data);
        if (container === "ts" && options.format === "mp4" && playlist.discontinuities) {
          warnings.push("This stream has discontinuities (often ad breaks). If the MP4 skips or stalls at those points, download it as TS instead.");
        }
        assembler = createAssembler(container, options.format, mux, extensionFromUrl);
      }
      if (initBytes) {
        const id = mapKey(segment.map);
        if (!writtenInit) assembler.write(initBytes);
        else if (id !== writtenInit) warnings.push("The stream switches format partway through, so the file may stop playing at that point.");
        writtenInit = writtenInit || id;
      }
      assembler.write(data, written > 0 && segment.discontinuity);
      // A TS stream mux.js can't read (H.265, AC-3, MP3...) yields nothing; say so early rather than after the download.
      if (mux && written === 2 && !assembler.produced()) {
        throw new Error("These segments use codecs the in-browser MP4 converter can't read (it supports H.264 video with AAC audio). Choose TS (original) instead.");
      }
      elapsed += segment.duration;
      written++;
      options.onProgress({ done: written, total: segments.length, bytes, seconds: elapsed });
    }
    wake();
  };

  const worker = async () => {
    while (nextIndex < segments.length) {
      const index = nextIndex++;
      while (index - written >= window && !signal.aborted) await new Promise<void>((resume) => waiting.push(resume));
      if (signal.aborted) throw signal.reason;
      const segment = segments[index];
      const needsInit = segment.map && (index === 0 || mapKey(segments[index - 1].map) !== mapKey(segment.map));
      const [data, initBytes] = await Promise.all([fetchSegment(segment, index), needsInit ? init(segment.map) : undefined]);
      bytes += data.byteLength + (initBytes?.byteLength ?? 0);
      ready.set(index, { data, init: initBytes });
      drain();
    }
  };

  try {
    options.onProgress({ done: 0, total: segments.length, bytes: 0, seconds: 0 });
    await Promise.all(Array.from({ length: Math.min(concurrency, segments.length) }, async () => {
      try { await worker(); } catch (cause) { controller.abort(cause); throw cause; }
    }));
  } catch (cause) {
    // The first failure aborts the rest; report it rather than the abort it caused in other workers.
    throw options.signal.aborted ? options.signal.reason : signal.reason ?? cause;
  } finally {
    options.signal.removeEventListener("abort", stop);
    waiting = [];
  }
  if (!assembler.produced()) throw new Error("No playable data came out of the download. Try TS (original) instead.");
  if (!playlist.endList) warnings.push("This is a live stream: the file holds only the segments the playlist listed when the download started.");
  return { blob: assembler.finish(), extension: assembler.extension, warnings };
}

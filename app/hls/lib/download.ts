/**
 * Browser-side HLS fetching: playlists, segments (with byte ranges and retries), AES-128 decryption, and the
 * download engine that fetches segments in parallel but writes them in order.
 * Everything runs in the visitor's browser, so the stream's server must allow cross-origin reads (CORS).
 */
import { ivFor, parsePlaylist, SUPPORTED_KEY_METHODS, type InitMap, type MediaPlaylist, type Segment } from "./m3u8";
import { createAssembler, remuxes, sniffContainer, type Assembler, type Format } from "./remux";
import { unsupportedCodecs } from "./mp4";

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

/** A final HTTP failure: not retried, and reported as it is. */
class HttpError extends Error {}

function httpError(status: number, what: string) {
  if (status === 401 || status === 403) return new HttpError(`The server refused access to the ${what} (HTTP ${status}). The link may have expired, or it only works on the site it came from. Copy a fresh address and try again.`);
  if (status === 404 || status === 410) return new HttpError(`The ${what} wasn't found (HTTP ${status}). The link may have expired.`);
  if (status === 429) return new HttpError(`The server is rate-limiting requests for the ${what} (HTTP 429). Wait a minute and try again.`);
  return new HttpError(`The server returned HTTP ${status} for the ${what}.`);
}

const blockedMessage = (what: string) => `Couldn't read the ${what}. The server doesn't allow other websites to load it (CORS), the address is wrong, or you're offline. Streams that only play on their own website can't be loaded here.`;

const retryable = (status: number) => status === 408 || status === 429 || status >= 500;
const pause = (ms: number, signal?: AbortSignal) => new Promise<void>((done, fail) => {
  const timer = setTimeout(done, ms);
  signal?.addEventListener("abort", () => { clearTimeout(timer); fail(signal.reason); }, { once: true });
});

/** How long a request may go without receiving any data before it's abandoned and retried. */
export const STALL_MS = 30_000;

type Fetched = { bytes: Bytes; status: number; url: string };

/** Reads a response body, aborting through `stall` if no data arrives for STALL_MS. */
async function readBody(response: Response, arm: () => void): Promise<Bytes> {
  if (!response.body) return new Uint8Array(await response.arrayBuffer());
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    arm();
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    length += value.byteLength;
  }
  const bytes = new Uint8Array(length);
  let at = 0;
  for (const chunk of chunks) { bytes.set(chunk, at); at += chunk.byteLength; }
  return bytes;
}

/**
 * GET with up to three attempts for network errors, stalls (no data for STALL_MS), and 408/429/5xx.
 * Byte ranges use a Range header; a server that ignores it and sends the whole file is handled too.
 */
async function request(url: string, what: string, signal?: AbortSignal, range?: { offset: number; length: number }): Promise<Fetched> {
  const headers = range ? { Range: `bytes=${range.offset}-${range.offset + range.length - 1}` } : undefined;
  for (let attempt = 1; ; attempt++) {
    const attemptControl = new AbortController();
    const forward = () => attemptControl.abort(signal.reason);
    signal?.addEventListener("abort", forward, { once: true });
    let stalled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { stalled = true; attemptControl.abort(); }, STALL_MS);
    };
    try {
      arm();
      const response = await fetch(url, { signal: attemptControl.signal, headers, credentials: "omit" });
      if (!response.ok) {
        response.body?.cancel().catch(() => undefined);
        if (attempt < 3 && retryable(response.status)) { await pause(800 * attempt, signal); continue; }
        throw httpError(response.status, what);
      }
      let bytes = await readBody(response, arm);
      // A server that ignores Range sends the whole file with 200; cut the requested part out of it.
      if (range && response.status === 200 && bytes.byteLength > range.length) bytes = bytes.slice(range.offset, range.offset + range.length);
      return { bytes, status: response.status, url: response.url || url };
    } catch (cause) {
      if (signal?.aborted) throw signal.reason;
      if (cause instanceof HttpError) throw cause;
      if (attempt < 3) { await pause(600 * attempt, signal); continue; }
      if (stalled) throw new Error(`The server stopped sending the ${what} (nothing arrived for ${STALL_MS / 1000} seconds, three times). Check your connection and try again.`, { cause });
      throw new Error(blockedMessage(what), { cause });
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", forward);
    }
  }
}

/** Fetches and parses a playlist. The final URL (after redirects) is the base for its relative links. */
export async function loadPlaylist(input: string, signal?: AbortSignal) {
  const url = checkStreamUrl(input);
  const fetched = await request(url, "playlist", signal);
  const text = new TextDecoder().decode(fetched.bytes);
  return { text, playlist: parsePlaylist(text, fetched.url) };
}

/** `phase` is "download" while segments arrive, then "convert" while an MP4 is built (`converted` from 0 to 1). */
export type DownloadProgress = { phase: "download" | "convert"; done: number; total: number; bytes: number; seconds: number; converted: number };

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
      keys.set(uri, request(uri, "decryption key", signal).then(({ bytes: raw }) => {
        if (raw.byteLength !== 16) throw new Error(`The decryption key should be 16 bytes but is ${raw.byteLength}. The key URL may need the original site's login.`);
        return crypto.subtle.importKey("raw", raw, "AES-CBC", false, ["decrypt"]);
      }));
    }
    return keys.get(uri);
  };
  const init = (map: InitMap) => {
    const id = mapKey(map);
    if (!inits.has(id)) inits.set(id, request(map.uri, "init segment", signal, map.byteRange).then((fetched) => fetched.bytes));
    return inits.get(id);
  };

  async function fetchSegment(segment: Segment, index: number): Promise<Bytes> {
    let { bytes } = await request(segment.uri, `segment ${index + 1}`, signal, segment.byteRange);
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

  const extensionFromUrl = (/\.([a-z0-9]{2,4})(?:[?#]|$)/i.exec(segments[0].uri)?.[1] || "bin").toLowerCase();
  const needsInit = (index: number) => {
    const segment = segments[index];
    // Each timeline of a rebuilt MP4 starts with an init section, so a discontinuity needs one even if the map is unchanged.
    return segment.map && (index === 0 || segment.discontinuity || mapKey(segments[index - 1].map) !== mapKey(segment.map));
  };
  let assembler: Assembler;
  let writtenInit = "";
  let elapsed = 0;
  let written = 0;
  let nextIndex = 0;
  let bytes = 0;
  const ready = new Map<number, { data: Bytes; init?: Bytes }>();
  let waiting: (() => void)[] = [];
  const wake = () => waiting.splice(0).forEach((resume) => resume());
  signal.addEventListener("abort", wake, { once: true });
  const report = (phase: DownloadProgress["phase"], converted = 0) =>
    options.onProgress({ phase, done: written, total: segments.length, bytes, seconds: elapsed, converted });

  // Writes every segment that is next in line. Runs synchronously, so writes never interleave.
  const drain = () => {
    while (ready.has(written)) {
      const { data, init: initBytes } = ready.get(written);
      ready.delete(written);
      const segment = segments[written];
      const discontinuity = written > 0 && segment.discontinuity;
      if (initBytes) {
        const id = mapKey(segment.map);
        if (assembler.timelines) assembler.write(initBytes, discontinuity || (written > 0 && id !== writtenInit));
        else if (!writtenInit) assembler.write(initBytes);
        else if (id !== writtenInit) warnings.push("The stream switches format partway through, so the file may stop playing at that point.");
        writtenInit = assembler.timelines ? id : writtenInit || id;
        assembler.write(data);
      } else {
        assembler.write(data, discontinuity);
      }
      elapsed += segment.duration;
      written++;
      report("download");
    }
    wake();
  };

  const fetchWithInit = async (index: number) => {
    const segment = segments[index];
    const [data, initBytes] = await Promise.all([fetchSegment(segment, index), needsInit(index) ? init(segment.map) : undefined]);
    bytes += data.byteLength + (initBytes?.byteLength ?? 0);
    return { data, init: initBytes };
  };

  const worker = async () => {
    while (nextIndex < segments.length) {
      const index = nextIndex++;
      while (index - written >= window && !signal.aborted) await new Promise<void>((resume) => waiting.push(resume));
      if (signal.aborted) throw signal.reason;
      ready.set(index, await fetchWithInit(index));
      drain();
    }
  };

  try {
    report("download");
    // The first segment comes alone: it identifies the container and, for MP4, shows whether the codecs fit,
    // so an unsupported stream fails now rather than after the whole download.
    const first = await fetchWithInit(0);
    let container = first.init ? "fmp4" : sniffContainer(first.data);
    let format = options.format;
    if (remuxes(container, format)) {
      const sample = new Blob(first.init ? [first.init, first.data] : [first.data]);
      const unsupported = await unsupportedCodecs(sample, container as "ts" | "fmp4").catch(() => ["a format the converter can't read"]);
      if (unsupported.length && container === "fmp4") {
        // fMP4 is already MP4: join it as it is rather than fail.
        format = "original";
        warnings.push("The stream couldn't be rebuilt as a standard MP4, so its fragments were joined as they are. If it doesn't play, try VLC.");
      } else if (unsupported.length) {
        throw new Error(`These segments use ${unsupported.join(" and ")}, which can't be saved as MP4 here. Choose TS (original) instead.`);
      }
    }
    if (container === "ts" && remuxes(container, format) && playlist.discontinuities) {
      warnings.push("This stream has discontinuities (often ad breaks). They're joined into one timeline; if the MP4 glitches at those points, download it as TS instead.");
    }
    if (container === "unknown" && first.init) container = "fmp4";
    assembler = createAssembler(container, format, extensionFromUrl);
    ready.set(0, first);
    nextIndex = 1;
    drain();
    await Promise.all(Array.from({ length: Math.min(concurrency, segments.length - 1) }, async () => {
      try { await worker(); } catch (cause) { controller.abort(cause); throw cause; }
    }));
    report("convert", 0);
    const blob = await assembler.finish({ signal, onProgress: (fraction) => report("convert", fraction) });
    if (!blob.size) throw new Error("No playable data came out of the download. Try TS (original) instead.");
    if (!playlist.endList) warnings.push("This is a live stream: the file holds only the segments the playlist listed when the download started.");
    return { blob, extension: assembler.extension, warnings };
  } catch (cause) {
    // The first failure aborts the rest; report it rather than the abort it caused in other workers.
    throw options.signal.aborted ? options.signal.reason : signal.reason ?? cause;
  } finally {
    options.signal.removeEventListener("abort", stop);
    waiting = [];
  }
}

export interface BrowserTorrentFile {
  name: string;
  path: string;
  length: number;
  downloaded: number;
  progress: number;
  done: boolean;
  select(priority?: number): void;
  deselect(): void;
  blob(): Promise<Blob>;
}
export interface BrowserTorrent {
  name: string;
  infoHash: string;
  length: number;
  progress: number;
  downloaded: number;
  downloadSpeed: number;
  uploadSpeed: number;
  numPeers: number;
  private: boolean;
  files: BrowserTorrentFile[];
  pieces: unknown[];
  destroyed: boolean;
  on(event: string, listener: (...args: unknown[]) => void): this;
  deselect(start: number, end: number, priority?: number): void;
  pause(): void;
  resume(): void;
}
export interface BrowserTorrentClient {
  destroyed: boolean;
  on(event: string, listener: (...args: unknown[]) => void): this;
  add(input: string | Uint8Array, options: Record<string, unknown>, ready: (torrent: BrowserTorrent) => void): BrowserTorrent;
  destroy(callback?: () => void): void;
}
interface WebTorrentConstructor {
  new(options?: Record<string, unknown>): BrowserTorrentClient;
  WEBRTC_SUPPORT: boolean;
}
let engine: Promise<WebTorrentConstructor> | undefined;
export async function loadTorrentEngine(): Promise<WebTorrentConstructor> {
  if (typeof window === "undefined") throw new Error("The downloader runs in your browser only.");
  if (!window.isSecureContext) throw new Error("Use HTTPS or localhost to download in your browser.");
  if (!engine) {
    const moduleUrl = "/vendor/webtorrent-3.0.21.min.js";
    engine = import(/* webpackIgnore: true */ /* turbopackIgnore: true */ moduleUrl)
      .then((module) => module.default as WebTorrentConstructor)
      .catch((error) => { engine = undefined; throw error; });
  }
  return engine;
}

/** Ephemeral chunk store: avoids leftover OPFS data when a tab closes unexpectedly. */
export class MemoryChunkStore {
  private chunks = new Map<number, Uint8Array>();
  private closed = false;
  constructor(readonly chunkLength: number) {}
  put(index: number, data: Uint8Array, callback: (error?: Error) => void) {
    if (this.closed) { queueMicrotask(() => callback(new Error("Download storage was closed."))); return; }
    this.chunks.set(index, data.slice()); queueMicrotask(() => callback());
  }
  get(index: number, options: { offset?: number; length?: number } | ((error: Error | null, data?: Uint8Array) => void), callback?: (error: Error | null, data?: Uint8Array) => void) {
    if (typeof options === "function") { callback = options; options = {}; }
    const chunk = this.chunks.get(index);
    const offset = options.offset ?? 0;
    const length = options.length ?? ((chunk?.length ?? 0) - offset);
    queueMicrotask(() => chunk && !this.closed ? callback(null, chunk.subarray(offset, offset + length)) : callback(new Error("Piece is not available yet.")));
  }
  close(callback: (error?: Error) => void) { this.closed = true; this.chunks.clear(); queueMicrotask(() => callback?.()); }
  destroy(callback: (error?: Error) => void) { this.close(callback); }
}
export const MAX_BROWSER_DOWNLOAD = 256 * 1024 * 1024;
export const DEMO_TEXT = "ToolsBase browser download test\n\nThis small file is fetched from this website as an HTTP web seed, checked against its torrent piece hash, and saved through the real browser torrent engine.\nNo public swarm or external tracker is used by this sample.\n";

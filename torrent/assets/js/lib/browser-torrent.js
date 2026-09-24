/** Lazy WebTorrent loader and in-memory chunk storage for the connected browser tools. */
// Resolved relative to this module so the site works from any base path (e.g. /alltools/torrent/).
const ENGINE_URL = new URL("../../vendor/webtorrent-3.0.21.min.js", import.meta.url).href;
/** Same-origin HTTP web seed for the downloader's "Try a small sample" button. */
export const DEMO_URL = new URL("../../demo/readme.txt", import.meta.url).href;
let engine;
export async function loadTorrentEngine() {
    if (typeof window === "undefined")
        throw new Error("The downloader runs in your browser only.");
    if (!window.isSecureContext)
        throw new Error("Use HTTPS or localhost to download in your browser.");
    if (!engine) {
        engine = import(ENGINE_URL)
            .then((module) => module.default)
            .catch((error) => { engine = undefined; throw error; });
    }
    return engine;
}
/** Ephemeral chunk store: avoids leftover OPFS data when a tab closes unexpectedly. */
export class MemoryChunkStore {
    chunkLength;
    chunks = new Map();
    closed = false;
    constructor(chunkLength) {
        this.chunkLength = chunkLength;
    }
    put(index, data, callback) {
        if (this.closed) {
            queueMicrotask(() => callback(new Error("Download storage was closed.")));
            return;
        }
        this.chunks.set(index, data.slice());
        queueMicrotask(() => callback());
    }
    get(index, options, callback) {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }
        const chunk = this.chunks.get(index);
        const offset = options.offset ?? 0;
        const length = options.length ?? ((chunk?.length ?? 0) - offset);
        queueMicrotask(() => chunk && !this.closed ? callback(null, chunk.subarray(offset, offset + length)) : callback(new Error("Piece is not available yet.")));
    }
    close(callback) { this.closed = true; this.chunks.clear(); queueMicrotask(() => callback?.()); }
    destroy(callback) { this.close(callback); }
}
export const MAX_BROWSER_DOWNLOAD = 256 * 1024 * 1024;
export const DEMO_TEXT = "ToolsBase browser download test\n\nThis small file is fetched from this website as an HTTP web seed, checked against its torrent piece hash, and saved through the real browser torrent engine.\nNo public swarm or external tracker is used by this sample.\n";

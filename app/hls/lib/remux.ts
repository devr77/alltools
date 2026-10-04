/**
 * Turns a run of HLS segments into one file. MPEG-TS can be rewrapped as MP4 with mux.js (H.264/AAC only, no
 * re-encoding) or kept as TS; fragmented MP4 (CMAF) and packed audio are joined as they are.
 * The output is collected as Blob parts so browsers can page large downloads out of memory.
 */
import type muxjs from "mux.js";

export type Container = "ts" | "fmp4" | "aac" | "mp3" | "unknown";
export type Format = "mp4" | "original";
type Bytes = Uint8Array<ArrayBuffer>;

/** Identifies a segment's container from its first bytes (after decryption). */
export function sniffContainer(bytes: Uint8Array): Container {
  if (bytes[0] === 0x47 && (bytes.length < 189 || bytes[188] === 0x47)) return "ts";
  const box = String.fromCharCode(...bytes.subarray(4, 8));
  if (["ftyp", "styp", "moof", "sidx", "moov", "emsg", "prft"].includes(box)) return "fmp4";
  let offset = 0;
  // Packed audio starts with an ID3 tag carrying its timestamp; skip it (size is syncsafe, plus a footer if flagged).
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33 && bytes.length > 10) {
    offset = 10 + ((bytes[6] & 0x7f) << 21 | (bytes[7] & 0x7f) << 14 | (bytes[8] & 0x7f) << 7 | (bytes[9] & 0x7f)) + (bytes[5] & 0x10 ? 10 : 0);
  }
  if (bytes[offset] === 0xff && (bytes[offset + 1] & 0xf6) === 0xf0) return "aac";
  if (bytes[offset] === 0xff && (bytes[offset + 1] & 0xe0) === 0xe0) return "mp3";
  return "unknown";
}

export type Assembler = {
  extension: string; type: string;
  /** Appends one segment; `discontinuity` starts a new timeline (timestamps reset) that continues where the last ended. */
  write(bytes: Bytes, discontinuity?: boolean): void;
  /** Appends part of a segment (a chunk of a local file); call flush() when the segment or file ends. */
  push(bytes: Bytes): void;
  flush(): void;
  /** Whether anything playable has been produced yet. */
  produced(): boolean;
  finish(): Blob;
};

/**
 * Creates the writer for a stream whose first segment has the given container. `mux` is the loaded mux.js module,
 * needed only to convert TS to MP4. `fallbackExtension` names unrecognized formats (taken from the segment URL).
 */
export function createAssembler(container: Container, format: Format, mux: typeof muxjs | null, fallbackExtension = "bin"): Assembler {
  const parts: Blob[] = [];
  if (container === "ts" && format === "mp4") {
    if (!mux) throw new Error("The MP4 converter isn't loaded.");
    let wroteInit = false;
    // Where the output so far ends, on the 90 kHz clock: the later of the video and audio tracks.
    let end = 0;
    const extend = (info: { end: { dts: number } }) => { end = Math.max(end, info.end.dts); };
    // mux.js applies baseMediaDecodeTime only when it first meets a track, so each timeline (the start, and every
    // discontinuity) gets a fresh transmuxer that starts exactly where the previous one ended.
    const timeline = (start: number) => {
      const next = new mux.mp4.Transmuxer({ remux: true, baseMediaDecodeTime: Math.round(start) });
      next.on("videoSegmentTimingInfo", extend);
      next.on("audioSegmentTimingInfo", extend);
      next.on("data", (segment) => {
        // Every flush repeats the init segment (moov); a playable file has it once, at the start.
        if (!wroteInit) {
          parts.push(new Blob([segment.initSegment]));
          wroteInit = true;
        }
        parts.push(new Blob([segment.data]));
      });
      return next;
    };
    let transmuxer = timeline(0);
    return {
      extension: "mp4", type: "video/mp4",
      write(bytes, discontinuity) {
        if (discontinuity && wroteInit) transmuxer = timeline(end);
        transmuxer.push(bytes);
        transmuxer.flush();
      },
      push: (bytes) => transmuxer.push(bytes),
      flush: () => transmuxer.flush(),
      produced: () => wroteInit,
      finish: () => new Blob(parts, { type: "video/mp4" }),
    };
  }
  const [extension, type] = container === "ts" ? ["ts", "video/mp2t"] : container === "fmp4" ? ["mp4", "video/mp4"]
    : container === "aac" ? ["aac", "audio/aac"] : container === "mp3" ? ["mp3", "audio/mpeg"] : [fallbackExtension, "application/octet-stream"];
  return {
    extension, type,
    write(bytes) { parts.push(new Blob([bytes])); },
    push(bytes) { parts.push(new Blob([bytes])); },
    flush() { /* nothing buffered */ },
    produced: () => parts.length > 0,
    finish: () => new Blob(parts, { type }),
  };
}

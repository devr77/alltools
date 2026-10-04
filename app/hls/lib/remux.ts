/**
 * Turns a run of HLS segments into one file. For MP4, MPEG-TS and fragmented MP4 segments are collected per timeline
 * (the runs between discontinuities) and rewrapped as a standard MP4 at the end (mp4.ts, no re-encoding); otherwise
 * the segments are joined as they are (TS, packed AAC/MP3). Parts are kept as Blobs so browsers can page large
 * downloads out of memory.
 */
import { remuxToMp4 } from "./mp4";

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

/** Whether segments in this container become a standard MP4 when the visitor asks for MP4. */
export const remuxes = (container: Container, format: Format) => format === "mp4" && (container === "ts" || container === "fmp4");

export type Assembler = {
  extension: string; type: string;
  /** True when the output is rebuilt per timeline, so each fMP4 timeline must start with its own init section. */
  timelines: boolean;
  /** Appends one segment (or init section); `discontinuity` starts a new timeline that continues where the last ended. */
  write(bytes: Bytes, discontinuity?: boolean): void;
  /** Builds the file. MP4 output is rewrapped here, which reports progress from 0 to 1. */
  finish(options?: { onProgress?: (fraction: number) => void; signal?: AbortSignal }): Promise<Blob>;
};

/** Creates the writer for a stream whose first segment has the given container. `fallbackExtension` names unrecognized formats. */
export function createAssembler(container: Container, format: Format, fallbackExtension = "bin"): Assembler {
  if (remuxes(container, format)) {
    const timelines: Blob[][] = [[]];
    return {
      extension: "mp4", type: "video/mp4", timelines: true,
      write(bytes, discontinuity) {
        if (discontinuity && timelines.at(-1).length) timelines.push([]);
        timelines.at(-1).push(new Blob([bytes]));
      },
      finish: (options) => remuxToMp4(timelines.map((parts) => new Blob(parts)), { container: container as "ts" | "fmp4", ...options }),
    };
  }
  const parts: Blob[] = [];
  const [extension, type] = container === "ts" ? ["ts", "video/mp2t"] : container === "fmp4" ? ["mp4", "video/mp4"]
    : container === "aac" ? ["aac", "audio/aac"] : container === "mp3" ? ["mp3", "audio/mpeg"] : [fallbackExtension, "application/octet-stream"];
  return {
    extension, type, timelines: false,
    write(bytes) { parts.push(new Blob([bytes])); },
    finish: async () => new Blob(parts, { type }),
  };
}

/**
 * M3U8 (HLS playlist) parser, after RFC 8216 and the current HLS draft. Pure functions with no browser APIs, so it is
 * shared by the downloader, player, and checker, and unit-tested in tests/hls.test.mjs.
 * Relative URIs are resolved against the playlist's own URL (pass the final URL after redirects).
 */

export type ByteRange = { length: number; offset: number };
export type Key = { method: string; uri?: string; iv?: string; keyFormat?: string };
export type InitMap = { uri: string; byteRange?: ByteRange };

export type Variant = {
  uri: string; bandwidth: number; averageBandwidth?: number; codecs?: string; resolution?: { width: number; height: number };
  frameRate?: number; audio?: string; video?: string; subtitles?: string; iframeOnly?: boolean;
};

export type Rendition = {
  type: string; groupId: string; name: string; language?: string; uri?: string; isDefault: boolean; channels?: string;
};

export type Segment = {
  uri: string; duration: number; sequence: number; key?: Key; map?: InitMap; byteRange?: ByteRange;
  discontinuity: boolean; gap: boolean;
};

export type MasterPlaylist = { kind: "master"; url: string; variants: Variant[]; renditions: Rendition[]; warnings: string[] };

export type MediaPlaylist = {
  kind: "media"; url: string; version: number; targetDuration: number; mediaSequence: number; playlistType?: string;
  endList: boolean; segments: Segment[]; duration: number; discontinuities: number; warnings: string[];
};

export type Playlist = MasterPlaylist | MediaPlaylist;

/** Methods this project can decrypt: none, or whole-segment AES-128-CBC (the key is a plain file the player fetches). */
export const SUPPORTED_KEY_METHODS = ["NONE", "AES-128"];

/** Parses an attribute list: KEY=value,KEY="quoted, with commas",... */
export function parseAttributes(text: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const [, name, value] of text.matchAll(/([A-Z0-9-]+)=("[^"]*"|[^,]*)/g)) {
    attributes[name] = value.startsWith('"') ? value.slice(1, -1) : value.trim();
  }
  return attributes;
}

/** "length[@offset]"; a missing offset continues from the end of the previous range of the same resource. */
export function parseByteRange(text: string, previousEnd = 0): ByteRange | undefined {
  const match = /^\s*(\d+)(?:@(\d+))?\s*$/.exec(text);
  if (!match) return undefined;
  return { length: Number(match[1]), offset: match[2] === undefined ? previousEnd : Number(match[2]) };
}

function resolve(uri: string, base: string) {
  try { return new URL(uri, base).href; } catch { return uri; }
}

/** Why a response isn't a playlist, phrased for the person who pasted the URL. */
export function notPlaylistReason(text: string): string {
  const start = text.trimStart().slice(0, 200).toLowerCase();
  if (start.startsWith("<!doctype html") || start.startsWith("<html") || start.includes("<head")) {
    return "That address returned a web page, not an M3U8 playlist. Paste the playlist URL itself (it usually ends in .m3u8), not the page the video is on.";
  }
  if (start.startsWith("<?xml") || start.includes("<mpd")) {
    return "That address is a DASH manifest (MPD), not an HLS playlist. Only HLS (.m3u8) streams are supported.";
  }
  if (start.startsWith("{") || start.startsWith("[")) {
    return "That address returned JSON, not an M3U8 playlist. Paste the playlist URL itself, which usually ends in .m3u8.";
  }
  return "That address didn't return an M3U8 playlist. A playlist starts with #EXTM3U.";
}

export function isPlaylist(text: string) {
  return text.replace(/^﻿/, "").trimStart().startsWith("#EXTM3U");
}

/** Parses a master or media playlist. Throws with a readable message when the text isn't a playlist. */
export function parsePlaylist(text: string, url: string): Playlist {
  if (!isPlaylist(text)) throw new Error(notPlaylistReason(text));
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.some((line) => line.startsWith("#EXT-X-STREAM-INF:")) ? parseMaster(lines, url) : parseMedia(lines, url);
}

function parseMaster(lines: string[], url: string): MasterPlaylist {
  const variants: Variant[] = [];
  const renditions: Rendition[] = [];
  const warnings: string[] = [];
  let pending: Record<string, string> | null = null;
  for (const line of lines) {
    if (line.startsWith("#EXT-X-STREAM-INF:")) {
      pending = parseAttributes(line.slice(18));
    } else if (line.startsWith("#EXT-X-I-FRAME-STREAM-INF:")) {
      // Trick-play streams (keyframes only) are listed for completeness but never chosen for download or playback.
      const attributes = parseAttributes(line.slice(26));
      if (attributes.URI) variants.push({ ...variantFrom(attributes, resolve(attributes.URI, url)), iframeOnly: true });
    } else if (line.startsWith("#EXT-X-MEDIA:")) {
      const attributes = parseAttributes(line.slice(13));
      renditions.push({
        type: attributes.TYPE || "", groupId: attributes["GROUP-ID"] || "", name: attributes.NAME || attributes.LANGUAGE || "Unnamed",
        language: attributes.LANGUAGE, uri: attributes.URI ? resolve(attributes.URI, url) : undefined,
        isDefault: attributes.DEFAULT === "YES", channels: attributes.CHANNELS,
      });
    } else if (line.startsWith("#EXT-X-SESSION-KEY:")) {
      const method = parseAttributes(line.slice(19)).METHOD;
      if (method && !SUPPORTED_KEY_METHODS.includes(method)) warnings.push(`The stream declares ${method} encryption (DRM), which can't be downloaded or played here.`);
    } else if (!line.startsWith("#") && pending) {
      variants.push(variantFrom(pending, resolve(line, url)));
      pending = null;
    }
  }
  if (!variants.some((variant) => !variant.iframeOnly)) warnings.push("The master playlist lists no playable variants.");
  return { kind: "master", url, variants, renditions, warnings };
}

function variantFrom(attributes: Record<string, string>, uri: string): Variant {
  const [width, height] = (attributes.RESOLUTION || "").split("x").map(Number);
  return {
    uri, bandwidth: Number(attributes.BANDWIDTH) || 0,
    averageBandwidth: attributes["AVERAGE-BANDWIDTH"] ? Number(attributes["AVERAGE-BANDWIDTH"]) : undefined,
    codecs: attributes.CODECS, resolution: width && height ? { width, height } : undefined,
    frameRate: attributes["FRAME-RATE"] ? Number(attributes["FRAME-RATE"]) : undefined,
    audio: attributes.AUDIO, video: attributes.VIDEO, subtitles: attributes.SUBTITLES,
  };
}

function parseMedia(lines: string[], url: string): MediaPlaylist {
  const playlist: MediaPlaylist = {
    kind: "media", url, version: 1, targetDuration: 0, mediaSequence: 0, endList: false, segments: [], duration: 0, discontinuities: 0, warnings: [],
  };
  let key: Key | undefined;
  let map: InitMap | undefined;
  let duration: number | null = null;
  let byteRange: ByteRange | undefined;
  let discontinuity = false;
  let gap = false;
  // End of the last byte range per resource, for ranges that omit their offset.
  const rangeEnds = new Map<string, number>();
  let pendingRange: string | null = null;

  for (const line of lines) {
    if (line.startsWith("#EXT-X-VERSION:")) playlist.version = Number(line.slice(15)) || 1;
    else if (line.startsWith("#EXT-X-TARGETDURATION:")) playlist.targetDuration = Number(line.slice(22)) || 0;
    else if (line.startsWith("#EXT-X-MEDIA-SEQUENCE:")) playlist.mediaSequence = Number(line.slice(22)) || 0;
    else if (line.startsWith("#EXT-X-PLAYLIST-TYPE:")) playlist.playlistType = line.slice(21);
    else if (line === "#EXT-X-ENDLIST") playlist.endList = true;
    else if (line === "#EXT-X-DISCONTINUITY") discontinuity = true;
    else if (line === "#EXT-X-GAP") gap = true;
    else if (line.startsWith("#EXTINF:")) duration = Number.parseFloat(line.slice(8)) || 0;
    else if (line.startsWith("#EXT-X-BYTERANGE:")) pendingRange = line.slice(17);
    else if (line.startsWith("#EXT-X-KEY:")) {
      const attributes = parseAttributes(line.slice(11));
      const method = attributes.METHOD || "NONE";
      key = method === "NONE" ? undefined : {
        method, uri: attributes.URI ? resolve(attributes.URI, url) : undefined, iv: attributes.IV, keyFormat: attributes.KEYFORMAT,
      };
    } else if (line.startsWith("#EXT-X-MAP:")) {
      const attributes = parseAttributes(line.slice(11));
      if (attributes.URI) {
        const uri = resolve(attributes.URI, url);
        map = { uri, byteRange: attributes.BYTERANGE ? parseByteRange(attributes.BYTERANGE) : undefined };
      }
    } else if (!line.startsWith("#")) {
      const uri = resolve(line, url);
      if (pendingRange !== null) {
        byteRange = parseByteRange(pendingRange, rangeEnds.get(uri) ?? 0);
        if (byteRange) rangeEnds.set(uri, byteRange.offset + byteRange.length);
        pendingRange = null;
      }
      const length = duration ?? 0;
      if (duration === null) playlist.warnings.push(`Segment ${playlist.segments.length + 1} has no #EXTINF duration.`);
      playlist.segments.push({
        uri, duration: length, sequence: playlist.mediaSequence + playlist.segments.length, key, map, byteRange, discontinuity, gap,
      });
      if (discontinuity) playlist.discontinuities++;
      playlist.duration += length;
      duration = null;
      byteRange = undefined;
      discontinuity = false;
      gap = false;
    }
  }

  if (!playlist.segments.length) playlist.warnings.push("The playlist has no segments.");
  if (!playlist.targetDuration) playlist.warnings.push("#EXT-X-TARGETDURATION is missing.");
  const longest = Math.max(0, ...playlist.segments.map((segment) => segment.duration));
  if (playlist.targetDuration && Math.round(longest) > playlist.targetDuration) {
    playlist.warnings.push(`A segment lasts ${longest.toFixed(2)} s, longer than the ${playlist.targetDuration} s target duration.`);
  }
  for (const method of new Set(playlist.segments.map((segment) => segment.key?.method).filter(Boolean))) {
    if (!SUPPORTED_KEY_METHODS.includes(method)) playlist.warnings.push(`Segments use ${method} encryption (DRM), which can't be downloaded or played here.`);
  }
  return playlist;
}

/** The 16-byte AES-128 IV: the IV attribute when given, otherwise the segment's media sequence number (big-endian). */
export function ivFor(segment: Pick<Segment, "key" | "sequence">): Uint8Array<ArrayBuffer> {
  const iv = new Uint8Array(16);
  const hex = segment.key?.iv?.replace(/^0x/i, "");
  if (hex) {
    const padded = hex.padStart(32, "0").slice(-32);
    for (let index = 0; index < 16; index++) iv[index] = Number.parseInt(padded.slice(index * 2, index * 2 + 2), 16);
    return iv;
  }
  let sequence = segment.sequence;
  for (let index = 15; index >= 8 && sequence > 0; index--) {
    iv[index] = sequence % 256;
    sequence = Math.floor(sequence / 256);
  }
  return iv;
}

/** Playable variants, best first (by resolution height, then bandwidth). */
export function rankVariants(variants: Variant[]) {
  return variants.filter((variant) => !variant.iframeOnly)
    .sort((a, b) => (b.resolution?.height ?? 0) - (a.resolution?.height ?? 0) || b.bandwidth - a.bandwidth);
}

/** The audio renditions a variant's AUDIO group points to that live in their own playlist (not muxed into the video). */
export function separateAudio(master: MasterPlaylist, variant: Variant) {
  return master.renditions.filter((rendition) => rendition.type === "AUDIO" && rendition.groupId === variant.audio && rendition.uri);
}

/**
 * Whether declared codecs fit in the MP4 the downloader builds (mp4.ts): H.264, H.265, AV1, VP9, AAC, MP3, AC-3,
 * E-AC-3, Opus, FLAC; subtitle codecs are ignored. Undeclared codecs pass; the first segment is checked anyway.
 */
export function mp4Compatible(codecs?: string) {
  if (!codecs) return true;
  return codecs.split(",").map((codec) => codec.trim().toLowerCase())
    .every((codec) => /^(avc[13]|hvc1|hev1|dvh1|dvhe|av01|vp09|mp4a|ac-3|ec-3|opus|flac|wvtt|stpp)/.test(codec));
}

const VIDEO_NAMES = ["H.264", "H.265", "AV1", "VP9"];

/** Describes codecs in plain words, video first, e.g. "H.264 + AAC". */
export function describeCodecs(codecs?: string) {
  if (!codecs) return "";
  const names = codecs.split(",").map((codec) => {
    const id = codec.trim().toLowerCase();
    if (/^avc[13]/.test(id)) return "H.264";
    if (/^(hvc1|hev1)/.test(id)) return "H.265";
    if (/^(av01)/.test(id)) return "AV1";
    if (/^(vp09|vp9)/.test(id)) return "VP9";
    if (/^mp4a\.40\.34/.test(id) || id === "mp4a.6b") return "MP3";
    if (/^mp4a/.test(id)) return "AAC";
    if (/^(ac-3)/.test(id)) return "Dolby Digital";
    if (/^(ec-3)/.test(id)) return "Dolby Digital Plus";
    if (/^(opus)/.test(id)) return "Opus";
    if (/^(flac|fLaC)/i.test(id)) return "FLAC";
    if (/^(wvtt|stpp)/.test(id)) return "Subtitles";
    return codec.trim();
  });
  return [...new Set(names)].sort((a, b) => Number(VIDEO_NAMES.includes(b)) - Number(VIDEO_NAMES.includes(a))).join(" + ");
}

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const requirePackage = createRequire(import.meta.url);

function load(file) {
  const code = ts.transpileModule(readFileSync(new URL(`../app/hls/${file}`, import.meta.url), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const loaded = { exports: {} };
  const dir = file.includes("/") ? file.slice(0, file.lastIndexOf("/") + 1) : "";
  const resolve = (name) => (name.startsWith(".") ? load(`${dir}${name.replace(/^\.\//, "")}.ts`) : requirePackage(name));
  new Function("require", "module", "exports", code)(resolve, loaded, loaded.exports);
  return loaded.exports;
}
const m3u8 = load("lib/m3u8.ts");
const remux = load("lib/remux.ts");
const mp4 = load("lib/mp4.ts");
const format = load("lib/format.ts");
const { tools, findTool } = load("catalog.ts");

const MASTER = `#EXTM3U
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud",NAME="English, stereo",LANGUAGE="en",DEFAULT=YES,CHANNELS="2",URI="audio/en.m3u8"
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud",NAME="Deutsch",LANGUAGE="de",URI="audio/de.m3u8"
#EXT-X-STREAM-INF:BANDWIDTH=800000,AVERAGE-BANDWIDTH=700000,RESOLUTION=640x360,CODECS="avc1.4d401e,mp4a.40.2",FRAME-RATE=29.970
low/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080,CODECS="avc1.640028,mp4a.40.2",AUDIO="aud"
https://cdn.example.com/hd/index.m3u8?token=a,b
#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720,CODECS="hvc1.2.4.L123.B0,ec-3"
/abs/720.m3u8
#EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=90000,RESOLUTION=640x360,URI="low/iframes.m3u8"
`;

test("master playlists list variants, renditions, and resolve relative URIs", () => {
  const playlist = m3u8.parsePlaylist(MASTER, "https://media.example.org/show/master.m3u8");
  assert.equal(playlist.kind, "master");
  assert.equal(playlist.variants.length, 4);
  const [low, hd, hevc, iframes] = playlist.variants;
  assert.equal(low.uri, "https://media.example.org/show/low/index.m3u8");
  assert.deepEqual(low.resolution, { width: 640, height: 360 });
  assert.equal(low.averageBandwidth, 700000);
  assert.equal(low.frameRate, 29.97);
  assert.equal(hd.uri, "https://cdn.example.com/hd/index.m3u8?token=a,b");
  assert.equal(hevc.uri, "https://media.example.org/abs/720.m3u8");
  assert.equal(iframes.iframeOnly, true);
  assert.equal(playlist.renditions[0].name, "English, stereo");
  assert.equal(playlist.renditions[0].uri, "https://media.example.org/show/audio/en.m3u8");
  assert.equal(playlist.renditions[0].isDefault, true);
  assert.deepEqual(m3u8.separateAudio(playlist, hd).map((entry) => entry.language), ["en", "de"]);
  assert.deepEqual(m3u8.separateAudio(playlist, low), []);
  assert.deepEqual(m3u8.rankVariants(playlist.variants).map((variant) => variant.resolution.height), [1080, 720, 360]);
});

test("codec helpers describe codecs and know what fits in the MP4", () => {
  assert.equal(m3u8.describeCodecs("avc1.640028,mp4a.40.2"), "H.264 + AAC");
  assert.equal(m3u8.describeCodecs("hvc1.2.4.L123.B0,ec-3"), "H.265 + Dolby Digital Plus");
  assert.equal(m3u8.describeCodecs("mp4a.40.2,avc1.64001f"), "H.264 + AAC");
  assert.equal(m3u8.mp4Compatible("avc1.640028,mp4a.40.5"), true);
  assert.equal(m3u8.mp4Compatible("hvc1.2.4.L123.B0,ec-3"), true);
  assert.equal(m3u8.mp4Compatible("avc1.640028,ac-3,wvtt"), true);
  assert.equal(m3u8.mp4Compatible("mp4v.20.9,mp4a.40.2"), false);
  assert.equal(m3u8.mp4Compatible(undefined), true);
});

const MEDIA = `#EXTM3U
#EXT-X-VERSION:4
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:100
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-KEY:METHOD=AES-128,URI="../keys/k1.bin"
#EXTINF:6.006,
seg100.ts
#EXTINF:6.006,title
seg101.ts
#EXT-X-KEY:METHOD=AES-128,URI="https://keys.example.com/k2",IV=0x0000000000000000000000000000ABCD
#EXT-X-DISCONTINUITY
#EXTINF:4.5,
seg102.ts
#EXT-X-KEY:METHOD=NONE
#EXT-X-BYTERANGE:1000@0
#EXTINF:2,
all.ts
#EXT-X-BYTERANGE:500
#EXTINF:2,
all.ts
#EXT-X-GAP
#EXTINF:2,
missing.ts
#EXT-X-ENDLIST
`;

test("media playlists carry durations, sequence numbers, keys, byte ranges, and flags", () => {
  const playlist = m3u8.parsePlaylist(MEDIA, "https://media.example.org/show/low/index.m3u8");
  assert.equal(playlist.kind, "media");
  assert.equal(playlist.version, 4);
  assert.equal(playlist.targetDuration, 6);
  assert.equal(playlist.endList, true);
  assert.equal(playlist.segments.length, 6);
  assert.equal(Math.round(playlist.duration * 1000), 22512);
  assert.equal(playlist.discontinuities, 1);
  const [first, second, third, ranged, continued, gap] = playlist.segments;
  assert.equal(first.sequence, 100);
  assert.equal(first.uri, "https://media.example.org/show/low/seg100.ts");
  assert.equal(first.key.uri, "https://media.example.org/show/keys/k1.bin");
  assert.equal(second.key, first.key);
  assert.equal(third.discontinuity, true);
  assert.equal(third.key.iv, "0x0000000000000000000000000000ABCD");
  assert.equal(ranged.key, undefined);
  assert.deepEqual(ranged.byteRange, { length: 1000, offset: 0 });
  assert.deepEqual(continued.byteRange, { length: 500, offset: 1000 });
  assert.equal(gap.gap, true);
  assert.deepEqual(playlist.warnings, []);
});

test("fMP4 init sections apply to the segments after them", () => {
  const playlist = m3u8.parsePlaylist(`#EXTM3U
#EXT-X-TARGETDURATION:4
#EXT-X-MAP:URI="init.mp4",BYTERANGE="720@0"
#EXTINF:4,
a.m4s
#EXTINF:4,
b.m4s
`, "https://x.test/v/main.m3u8");
  assert.deepEqual(playlist.segments[1].map, { uri: "https://x.test/v/init.mp4", byteRange: { length: 720, offset: 0 } });
  assert.equal(playlist.endList, false);
});

test("warnings flag out-of-spec durations, missing tags, and DRM", () => {
  const playlist = m3u8.parsePlaylist(`#EXTM3U
#EXT-X-KEY:METHOD=SAMPLE-AES,URI="skd://key",KEYFORMAT="com.apple.streamingkeydelivery"
#EXTINF:12.4,
a.ts
b.ts
`, "https://x.test/a.m3u8");
  assert.ok(playlist.warnings.some((warning) => warning.includes("TARGETDURATION is missing")));
  assert.ok(playlist.warnings.some((warning) => warning.includes("no #EXTINF")));
  assert.ok(playlist.warnings.some((warning) => warning.includes("SAMPLE-AES")));
  const long = m3u8.parsePlaylist("#EXTM3U\n#EXT-X-TARGETDURATION:6\n#EXTINF:7.2,\na.ts\n#EXT-X-ENDLIST", "https://x.test/a.m3u8");
  assert.ok(long.warnings.some((warning) => warning.includes("longer than the 6 s target")));
  const rounded = m3u8.parsePlaylist("#EXTM3U\n#EXT-X-TARGETDURATION:6\n#EXTINF:6.4,\na.ts\n#EXT-X-ENDLIST", "https://x.test/a.m3u8");
  assert.deepEqual(rounded.warnings, []);
});

test("non-playlists are rejected with a specific reason", () => {
  assert.throws(() => m3u8.parsePlaylist("<!DOCTYPE html><html>", "https://x.test/"), /web page/);
  assert.throws(() => m3u8.parsePlaylist('<?xml version="1.0"?><MPD>', "https://x.test/"), /DASH/);
  assert.throws(() => m3u8.parsePlaylist('{"error":1}', "https://x.test/"), /JSON/);
  assert.throws(() => m3u8.parsePlaylist("hello", "https://x.test/"), /#EXTM3U/);
  assert.equal(m3u8.parsePlaylist("﻿#EXTM3U\n#EXTINF:1,\na.ts", "https://x.test/").kind, "media");
});

test("AES-128 IVs come from the IV attribute or the media sequence number", () => {
  const hex = (bytes) => Buffer.from(bytes).toString("hex");
  assert.equal(hex(m3u8.ivFor({ sequence: 0 })), "0".repeat(32));
  assert.equal(hex(m3u8.ivFor({ sequence: 258 })), `${"0".repeat(28)}0102`);
  assert.equal(hex(m3u8.ivFor({ sequence: 2 ** 40 + 1, key: { method: "AES-128" } })), `${"0".repeat(20)}010000000001`);
  assert.equal(hex(m3u8.ivFor({ sequence: 5, key: { method: "AES-128", iv: "0xABCD" } })), `${"0".repeat(28)}abcd`);
});

test("containers are recognized from their first bytes", () => {
  const tsBytes = new Uint8Array(376);
  tsBytes[0] = 0x47;
  tsBytes[188] = 0x47;
  assert.equal(remux.sniffContainer(tsBytes), "ts");
  const fmp4 = new Uint8Array([0, 0, 0, 24, ...Buffer.from("styp")]);
  assert.equal(remux.sniffContainer(fmp4), "fmp4");
  assert.equal(remux.sniffContainer(new Uint8Array([0xff, 0xf1, 0x50, 0x80])), "aac");
  const id3Aac = new Uint8Array([0x49, 0x44, 0x33, 4, 0, 0, 0, 0, 0, 2, 0, 0, 0xff, 0xf1]);
  assert.equal(remux.sniffContainer(id3Aac), "aac");
  assert.equal(remux.sniffContainer(new Uint8Array([0xff, 0xfb, 0x90, 0x64])), "mp3");
  assert.equal(remux.sniffContainer(new Uint8Array([0x89, 0x50, 0x4e, 0x47])), "unknown");
});

test("file names come from the input or a meaningful part of the URL", () => {
  assert.equal(format.fileBase("", "https://cdn.test/events/keynote-2026/master.m3u8"), "keynote-2026");
  assert.equal(format.fileBase("", "https://cdn.test/show/ep1.m3u8?sig=1"), "ep1");
  assert.equal(format.fileBase("  My: talk / part 1.mp4 ", "https://x.test/a.m3u8"), "My- talk - part 1");
  assert.equal(format.fileBase("", "not a url"), "video");
  assert.equal(format.formatDuration(3725.4), "1:02:05");
  assert.equal(format.formatDuration(65), "1:05");
  assert.equal(format.formatBytes(1_500_000), "1.5 MB");
  assert.equal(format.formatBitrate(2_149_280), "2.1 Mbps");
});

test("every tool has complete copy and a unique slug", () => {
  assert.equal(new Set(tools.map((tool) => tool.slug)).size, tools.length);
  for (const tool of tools) {
    assert.ok(findTool(tool.slug));
    assert.ok(tool.title.length <= 70, `${tool.slug} title is ${tool.title.length} chars`);
    assert.ok(tool.description.length <= 170, `${tool.slug} description is ${tool.description.length} chars`);
    for (const key of ["intro", "steps", "features", "useCases", "faqs"]) assert.ok(tool[key].length >= 2, `${tool.slug}.${key}`);
  }
});

/** A 188-byte TS packet carrying one PSI section (PAT or PMT) on `pid`, padded with 0xff. */
function psiPacket(pid, section) {
  const packet = new Uint8Array(188).fill(0xff);
  packet.set([0x47, 0x40 | (pid >> 8), pid & 0xff, 0x10, 0x00, ...section, 0, 0, 0, 0]);
  return packet;
}

test("TS program maps reveal every stream, including ones the MP4 builder can't hold", () => {
  // PAT: program 1 -> PMT on PID 0x1000. PMT: MPEG-2 video (0x02) on 0x100 and AAC (0x0f) on 0x101.
  const pat = psiPacket(0, [0x00, 0xb0, 13, 0x00, 0x01, 0xc1, 0x00, 0x00, 0x00, 0x01, 0xf0, 0x00]);
  const pmt = psiPacket(0x1000, [0x02, 0xb0, 23, 0x00, 0x01, 0xc1, 0x00, 0x00, 0xe1, 0x00, 0xf0, 0x00, 0x02, 0xe1, 0x00, 0xf0, 0x00, 0x0f, 0xe1, 0x01, 0xf0, 0x00]);
  assert.deepEqual(mp4.tsStreamTypes(new Uint8Array([...pat, ...pmt])), [0x02, 0x0f]);
  assert.deepEqual(mp4.tsStreamTypes(new Uint8Array([...pmt, ...pat])), [], "a PMT before its PAT isn't recognized");
  assert.deepEqual(mp4.tsStreamTypes(new Uint8Array(10)), []);
});

test("the blob writer appends, patches earlier bytes, and fills gaps", async () => {
  const writer = new mp4.BlobWriter();
  writer.write(0, new Uint8Array([1, 2, 3, 4]));
  writer.write(4, new Uint8Array([5, 6, 7, 8]));
  writer.write(2, new Uint8Array([9, 9, 9])); // spans the two parts, like an mdat size patch
  writer.write(10, new Uint8Array([7]));
  const bytes = [...new Uint8Array(await writer.finish("video/mp4").arrayBuffer())];
  assert.deepEqual(bytes, [1, 2, 9, 9, 9, 6, 7, 8, 0, 0, 7]);
});

test("MP4 output is rebuilt for TS and fMP4 only", () => {
  assert.equal(remux.remuxes("ts", "mp4"), true);
  assert.equal(remux.remuxes("fmp4", "mp4"), true);
  assert.equal(remux.remuxes("ts", "original"), false);
  assert.equal(remux.remuxes("aac", "mp4"), false);
  assert.equal(remux.createAssembler("aac", "mp4").extension, "aac");
  assert.equal(remux.createAssembler("ts", "original").extension, "ts");
});

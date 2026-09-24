import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Compile the dependency-free browser module in memory; no bundler or browser is needed.
const source = readFileSync(new URL("../app/lib/torrent.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { formatBytes, bencode, createTorrent, extractMagnet, inspectTorrent, makeMagnet, normalizeInfoHash, parseTrackers, toBase32, MAX_TORRENT_BYTES } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const sha1 = (data) => createHash("sha1").update(data).digest();
const sampleHash = "0123456789abcdef0123456789abcdef01234567";
const fixtureInfo = (overrides = {}) => ({ length: 5, name: "hello.txt", "piece length": 16384, pieces: new Uint8Array(sha1("hello")), ...overrides });
const fixture = (info = fixtureInfo()) => bencode({ info });

test("canonical bencode sorts dictionary keys and counts UTF-8 bytes", () => {
  assert.equal(Buffer.from(bencode({ z: [1, "é"], a: new Uint8Array([0, 255]) })).toString("hex"), Buffer.concat([Buffer.from("d1:a2:"), Buffer.from([0, 255]), Buffer.from("1:zli1e2:éee")]).toString("hex"));
});

test("hex and Base32 normalize to the same hash (independent RFC4648 vector)", () => {
  const hash = Buffer.from("12345678901234567890").toString("hex");
  assert.equal(toBase32(hash), "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");
  assert.equal(normalizeInfoHash("gezdgnbvgy3tqojqgezdgnbvgy3tqojq"), hash);
  assert.equal(normalizeInfoHash(sampleHash.toUpperCase()), sampleHash);
  assert.equal(normalizeInfoHash(`urn:btih:${sampleHash}`), sampleHash);
});

test("invalid hash lengths and characters are rejected", () => {
  for (const input of ["", "abc", "g".repeat(40), "0".repeat(32), "a".repeat(64)]) assert.throws(() => normalizeInfoHash(input), /info hash/);
});

test("magnet generation encodes names and trackers without corrupting query parameters", () => {
  const tracker = "https://tracker.example/announce?token=a&x=1";
  const magnet = makeMagnet(sampleHash, "A & B / café", [tracker, tracker]);
  const extracted = extractMagnet(magnet);
  assert.equal(extracted.infoHash, sampleHash);
  assert.equal(extracted.name, "A & B / café");
  assert.deepEqual(extracted.trackers, [tracker]);
  assert.equal(new URL(magnet).searchParams.getAll("tr").length, 1);
});

test("extractor handles Base32, hybrid magnets, repeated identical hashes", () => {
  const extracted = extractMagnet(`magnet:?xt=urn:btmh:1220abc&xt=urn:btih:${toBase32(sampleHash)}&xt=urn:btih:${sampleHash}`);
  assert.equal(extracted.infoHash, sampleHash);
});

test("extractor rejects missing, conflicting, malformed, or v2-only info hashes", () => {
  for (const input of ["not a url", `https://example.com/?xt=urn:btih:${sampleHash}`, "magnet:?xt=urn:btmh:1220abc", "magnet:?xt=urn:btih:abc", `magnet:?xt=urn:btih:${sampleHash}&xt=urn:btih:${"f".repeat(40)}`]) assert.throws(() => extractMagnet(input));
});

test("tracker validation accepts supported protocols and rejects unsafe or invalid URLs", () => {
  assert.deepEqual(parseTrackers(" udp://tracker.example:6969/announce\nhttps://tracker.example/a\nudp://tracker.example:6969/announce "), ["udp://tracker.example:6969/announce", "https://tracker.example/a"]);
  for (const tracker of ["javascript:alert(1)", "file:///tmp/a", "not-a-url", "https://user:password@tracker.example/a"]) assert.throws(() => parseTrackers(tracker));
  assert.throws(() => parseTrackers(Array.from({ length: 51 }, (_, n) => `https://tracker${n}.example/a`).join("\n")), /50/);
});

test("parser hashes the exact binary info dictionary, not the enclosing file", async () => {
  const info = fixtureInfo({ extra: new Uint8Array([0, 255, 128]) });
  const encoded = bencode(info);
  const bytes = bencode({ comment: "outside hash", info });
  const result = await inspectTorrent(bytes);
  assert.equal(result.infoHash, sha1(encoded).toString("hex"));
  assert.notEqual(result.infoHash, sha1(bytes).toString("hex"));
  assert.equal(result.totalSize, 5);
  assert.deepEqual(result.files, [{ path: "hello.txt", length: 5 }]);
  assert.equal(result.pieceCount, 1);
  assert.equal(result.comment, "outside hash");
});

test("outer metadata changes do not change info hash", async () => {
  const a = await inspectTorrent(bencode({ info: fixtureInfo(), comment: "one" }));
  const b = await inspectTorrent(bencode({ info: fixtureInfo(), comment: "two" }));
  assert.equal(a.infoHash, b.infoHash);
});

test("parser supports multi-file metadata, UTF-8 names and tracker tiers", async () => {
  const result = await inspectTorrent(bencode({
    announce: "udp://tracker.example:6969/a", "announce-list": [["https://tracker.example/a"]],
    info: { name: "café", files: [{ length: 2, path: ["sub", "a.txt"] }, { length: 3, path: ["b.txt"] }], "piece length": 16384, pieces: new Uint8Array(sha1("hello")), private: 1 },
  }));
  assert.deepEqual(result.files.map((file) => file.path), ["café/sub/a.txt", "café/b.txt"]);
  assert.equal(result.totalSize, 5);
  assert.equal(result.private, true);
  assert.equal(result.trackers.length, 2);
});

test("parser rejects truncated, duplicate, unsorted, or trailing bencode", async () => {
  for (const value of ["", "d", "d4:info", "d4:infoi1ee", "d4:infoi1e4:infoi2ee", "d1:zi1e1:ai2ee", "d4:infoi01ee", "d4:infoi-0ee", "d4:infoi9007199254740992ee", "d4:info999:abce"]) await assert.rejects(inspectTorrent(Buffer.from(value)));
  await assert.rejects(inspectTorrent(Buffer.concat([fixture(), Buffer.from("junk")])), /Unexpected data/);
});

test("parser enforces metadata byte size and nesting limits", async () => {
  await assert.rejects(inspectTorrent(new Uint8Array(MAX_TORRENT_BYTES + 1)), /10 MiB/);
  await assert.rejects(inspectTorrent(Buffer.from(`d4:info${"l".repeat(70)}${"e".repeat(71)}`)), /too complex/);
});

test("parser rejects invalid piece lengths and content sizes", async () => {
  for (const info of [fixtureInfo({ length: -1 }), fixtureInfo({ "piece length": 0 }), fixtureInfo({ pieces: new Uint8Array(19) }), fixtureInfo({ pieces: new Uint8Array(40) }), fixtureInfo({ files: [] })]) await assert.rejects(inspectTorrent(fixture(info)));
});

test("parser rejects v2-only torrents with a useful error", async () => {
  await assert.rejects(inspectTorrent(fixture({ name: "v2", "meta version": 2, "file tree": {} })), /V2-only/);
});

test("parser rejects traversal paths and duplicate files", async () => {
  await assert.rejects(inspectTorrent(fixture(fixtureInfo({ name: "../escape" }))), /names/);
  const file = { length: 1, path: ["a"] };
  await assert.rejects(inspectTorrent(fixture({ name: "dir", files: [file, file], "piece length": 16384, pieces: new Uint8Array(20) })), /duplicate/);
  await assert.rejects(inspectTorrent(fixture({ name: "dir", files: [{ length: 1, path: ["..", "a"] }], "piece length": 16384, pieces: new Uint8Array(20) })), /names/);
});

test("creator produces valid single-file metadata with independently computed piece hashes", async () => {
  const result = await createTorrent([new File(["hello"], "hello.txt")], { pieceLength: 16384 });
  const expectedInfo = fixtureInfo();
  assert.equal(result.summary.infoHash, sha1(bencode(expectedInfo)).toString("hex"));
  assert.equal((await inspectTorrent(result.bytes)).name, "hello.txt");
});

test("creator hashes across file boundaries, including the partial final piece", async () => {
  const first = Buffer.alloc(10000, 65), second = Buffer.alloc(23000, 66);
  const stream = Buffer.concat([first, second]);
  const expectedPieces = Buffer.concat([sha1(stream.subarray(0, 16384)), sha1(stream.subarray(16384, 32768)), sha1(stream.subarray(32768))]);
  const progress = [];
  const result = await createTorrent([new File([first], "a.bin"), new File([second], "b.bin")], { name: "bundle", pieceLength: 16384, onProgress: (value) => progress.push(value) });
  const expectedInfo = { name: "bundle", files: [{ length: 10000, path: ["a.bin"] }, { length: 23000, path: ["b.bin"] }], "piece length": 16384, pieces: new Uint8Array(expectedPieces) };
  assert.equal(result.summary.infoHash, sha1(bencode(expectedInfo)).toString("hex"));
  assert.equal(result.summary.pieceCount, 3);
  assert.equal(progress[0], 0);
  assert.equal(progress.at(-1), 100);
  assert.ok(progress.every((value, index) => index === 0 || value >= progress[index - 1]));
});

test("creator does not add an extra piece at an exact boundary", async () => {
  const result = await createTorrent([new File([new Uint8Array(32768)], "exact.bin")], { pieceLength: 16384 });
  assert.equal(result.summary.pieceCount, 2);
});

test("creator supports empty files without adding phantom hashes", async () => {
  const result = await createTorrent([new File([], "empty.txt")]);
  assert.equal(result.summary.totalSize, 0);
  assert.equal(result.summary.pieceCount, 0);
  const mixed = await createTorrent([new File([], "empty.txt"), new File(["hello"], "hello.txt")]);
  assert.equal(mixed.summary.totalSize, 5);
  assert.equal(mixed.summary.pieceCount, 1);
});

test("creator validates selection, duplicate names, piece size, and size limit before reading", async () => {
  const file = new File(["hello"], "a.txt");
  await assert.rejects(createTorrent([]), /Choose between/);
  await assert.rejects(createTorrent(Array(1001).fill(file)), /1,000/);
  await assert.rejects(createTorrent([file, file]), /duplicate/);
  await assert.rejects(createTorrent([file], { pieceLength: 12345 }), /piece size/);
  await assert.rejects(createTorrent([{ name: "large.bin", size: 1024 ** 3 + 1 }]), /1 GiB/);
  await assert.rejects(createTorrent([file], { name: "../bad" }), /names/);
});

test("private torrents require a tracker and set the private info flag", async () => {
  const file = new File(["hello"], "a.txt");
  await assert.rejects(createTorrent([file], { private: true }), /tracker/);
  const result = await createTorrent([file], { private: true, trackers: ["https://tracker.example/announce"], comment: "My file" });
  assert.equal(result.summary.private, true);
  assert.equal(result.summary.comment, "My file");
  assert.deepEqual(result.summary.trackers, ["https://tracker.example/announce"]);
});

test("creator honors cancellation before or during hashing", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(createTorrent([new File(["hello"], "a.txt")], { signal: controller.signal }), /canceled/);
  const midflight = new AbortController();
  await assert.rejects(createTorrent([new File([new Uint8Array(50000)], "a.bin")], { pieceLength: 16384, signal: midflight.signal, onProgress: (value) => { if (value > 0) midflight.abort(); } }), /canceled/);
});

test("byte formatting handles sub-byte speeds and invalid values", () => {
  assert.equal(formatBytes(0.25), "0.25 B");
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(NaN), "—");
});

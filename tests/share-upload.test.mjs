import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

function load(file) {
  const code = ts.transpileModule(readFileSync(new URL(`../app/share/${file}`, import.meta.url), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const loaded = { exports: {} };
  new Function("module", "exports", code)(loaded, loaded.exports);
  return loaded.exports;
}
const up = load("lib/upload.ts");
const { site, tools, sharedFaqs } = load("catalog.ts");
const cx = load("lib/compress.ts");

test("content types come from the browser type, then the extension, then binary", () => {
  assert.equal(up.resolveContentType("a.png", "image/png"), "image/png");
  assert.equal(up.resolveContentType("clip.MKV", ""), "video/x-matroska");
  assert.equal(up.resolveContentType("notes", ""), "application/octet-stream");
  assert.equal(up.resolveContentType("a.txt", "text/plain;charset=utf-8"), "text/plain");
});

test("active web formats are downgraded to downloads", () => {
  for (const [name, type] of [["x.html", "text/html"], ["x.svg", "image/svg+xml"], ["x.js", ""], ["x.bin", "application/xhtml+xml"], ["page.htm", "application/octet-stream"]]) {
    assert.equal(up.resolveContentType(name, type), "application/octet-stream", name);
  }
});

test("accept rules match type families and extensions", () => {
  const image = tools.find((tool) => tool.slug === "image-to-url");
  const doc = tools.find((tool) => tool.slug === "document-to-url");
  const any = tools.find((tool) => tool.slug === "file-to-url");
  const opts = (tool) => ({ accept: tool.accept, maxBytes: site.maxBytes, label: tool.label });
  assert.equal(up.validateFile({ name: "a.webp", size: 10, type: "image/webp" }, opts(image)), null);
  assert.match(up.validateFile({ name: "a.pdf", size: 10, type: "application/pdf" }, opts(image)), /not an image/);
  assert.match(up.validateFile({ name: "a.svg", size: 10, type: "image/svg+xml" }, opts(image)), /not an image/);
  assert.equal(up.validateFile({ name: "Deck.PPTX", size: 10, type: "" }, opts(doc)), null);
  assert.equal(up.validateFile({ name: "x.anything", size: 10, type: "" }, opts(any)), null);
  assert.match(up.validateFile({ name: "e.txt", size: 0, type: "text/plain" }, opts(any)), /empty/);
  assert.match(up.validateFile({ name: "big.mp4", size: site.maxBytes + 1, type: "video/mp4" }, opts(any)), /limit/);
});

test("byte sizes and time left are human readable", () => {
  assert.equal(up.formatBytes(999), "999 B");
  assert.equal(up.formatBytes(1500), "1.5 KB");
  assert.equal(up.formatBytes(100e6), "100 MB");
  const now = 1_000_000_000_000;
  assert.equal(up.timeLeft(now / 1000 + 7 * 86400, now), "in 7 days");
  assert.equal(up.timeLeft(now / 1000 + 86400, now), "in 24 hours");
  assert.equal(up.timeLeft(now / 1000 + 600, now), "in 10 min");
  assert.equal(up.timeLeft(now / 1000 - 1, now), "expired");
});

test("base64 input: data URIs, raw, URL-safe, wrapped, unpadded", () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
  const raw = png.toString("base64");
  assert.equal(up.decodeBase64Input(`data:image/png;base64,${raw}`).contentType, "image/png");
  assert.deepEqual([...up.decodeBase64Input(raw).bytes], [...png]);
  assert.equal(up.decodeBase64Input(raw).contentType, "image/png");
  const pdf = Buffer.from("%PDF-1.7 hello?>").toString("base64url");
  assert.equal(up.decodeBase64Input(pdf.replace(/(.{4})/g, "$1\n")).contentType, "application/pdf");
  assert.equal(up.decodeBase64Input(Buffer.from("plain words").toString("base64")).contentType, "application/octet-stream");
  assert.equal(up.decodeBase64Input(`data:image/svg+xml;base64,${Buffer.from("<svg/>").toString("base64")}`).contentType, "application/octet-stream");
  assert.throws(() => up.decodeBase64Input("not base64!!"), /not valid Base64/);
  assert.throws(() => up.decodeBase64Input("data:text/plain,hello"), /Base64 data URIs/);
  assert.throws(() => up.decodeBase64Input("   "), /Paste/);
});

test("API errors become readable messages", () => {
  assert.match(up.apiErrorMessage(429, null), /limit/);
  assert.equal(up.apiErrorMessage(400, { error: { message: "size too large" } }), "size too large");
  assert.equal(up.apiErrorMessage(400, { error: "bad type" }), "bad type");
  assert.match(up.apiErrorMessage(503, null), /trouble/);
});

test("catalog pages are complete and unique for SEO", () => {
  const slugs = new Set(), titles = new Set(), descriptions = new Set();
  for (const tool of tools) {
    for (const key of ["slug", "name", "title", "description", "lead", "formats", "label", "icon"]) assert.ok(tool[key], `${tool.slug}.${key}`);
    assert.ok(tool.intro.length >= 2 && tool.features.length >= 3 && tool.useCases.length >= 3 && tool.faqs.length >= 3, tool.slug);
    assert.ok(tool.title.length <= 70, `${tool.slug} title ${tool.title.length}`);
    assert.ok(tool.description.length >= 110 && tool.description.length <= 165, `${tool.slug} description ${tool.description.length}`);
    assert.ok(["file", "text", "base64", "qr"].includes(tool.mode));
    slugs.add(tool.slug); titles.add(tool.title); descriptions.add(tool.description);
  }
  assert.equal(slugs.size, tools.length);
  assert.equal(titles.size, tools.length);
  assert.equal(descriptions.size, tools.length);
  assert.ok(site.lifetimes.some((entry) => entry.days === site.defaultLifetime));
  assert.ok(sharedFaqs().every(([q, a]) => q && a));
});

test("image compression only targets still raster images", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp", "image/heic"]) assert.ok(cx.canCompressImage(type), type);
  for (const type of ["image/gif", "image/svg+xml", "video/mp4", "application/pdf"]) assert.ok(!cx.canCompressImage(type), type);
});

test("images are scaled to fit, never upscaled", () => {
  assert.deepEqual(cx.fitWithin(4000, 3000, 2560), { width: 2560, height: 1920 });
  assert.deepEqual(cx.fitWithin(1080, 1920, 2560), { width: 1080, height: 1920 });
  assert.deepEqual(cx.fitWithin(3000, 6000, 2560), { width: 1280, height: 2560 });
});

test("the smaller file is kept only when it saves enough", () => {
  assert.ok(cx.isWorthwhile(1000, 900));
  assert.ok(!cx.isWorthwhile(1000, 960));
  assert.ok(!cx.isWorthwhile(1000, 1200));
  assert.equal(cx.renameForType("IMG_1234.HEIC", "image/webp"), "IMG_1234.webp");
  assert.equal(cx.renameForType("photo", "image/jpeg"), "photo.jpg");
});

test("animated WebP and APNG are detected so they are not flattened", () => {
  const webp = (flags) => Uint8Array.from([..."RIFF"].map((c) => c.charCodeAt(0)).concat([0, 0, 0, 0], [..."WEBPVP8X"].map((c) => c.charCodeAt(0)), [10, 0, 0, 0, flags]));
  assert.ok(cx.isAnimated(webp(0x02), "image/webp"));
  assert.ok(!cx.isAnimated(webp(0x10), "image/webp"));
  const chunk = (type, length = 0) => [0, 0, 0, length, ...[...type].map((c) => c.charCodeAt(0)), ...new Array(length + 4).fill(0)];
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  assert.ok(cx.isAnimated(Uint8Array.from([...signature, ...chunk("IHDR", 13), ...chunk("acTL", 8), ...chunk("IDAT", 2)]), "image/png"));
  assert.ok(!cx.isAnimated(Uint8Array.from([...signature, ...chunk("IHDR", 13), ...chunk("IDAT", 2), ...chunk("acTL", 8)]), "image/png"));
});

test("JSON minification is lossless and never grows the input", () => {
  const pretty = JSON.stringify({ a: [1, 2, { b: "x y" }] }, null, 2);
  assert.equal(cx.minifyJson(pretty), '{"a":[1,2,{"b":"x y"}]}');
  assert.equal(cx.minifyJson("[1,2]"), "[1,2]");
  assert.throws(() => cx.minifyJson("{bad"));
});

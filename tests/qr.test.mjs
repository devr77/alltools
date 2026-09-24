import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const code = ts.transpileModule(readFileSync(new URL("../app/lib/qr-content.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const qr = { exports: {} };
new Function("module", "exports", code)(qr, qr.exports);
const { parseQrContent, safeHref } = qr.exports;

test("QR links are recognized, including bare domains, with safety warnings", () => {
  const link = parseQrContent("https://example.com/menu?table=4");
  assert.equal(link.kind, "url");
  assert.equal(link.href, "https://example.com/menu?table=4");
  assert.deepEqual(link.fields, [["Domain", "example.com"]]);
  assert.deepEqual(link.warnings, []);
  assert.equal(parseQrContent("www.example.org/a").href, "https://www.example.org/a");
  assert.match(parseQrContent("http://example.com").warnings[0], /isn't encrypted/);
  assert.ok(parseQrContent("https://xn--pypal-4ve.com/").warnings.some((w) => /international/.test(w)));
  assert.ok(parseQrContent("https://paypal.com@evil.example/").warnings.some((w) => /username/.test(w)));
  assert.ok(parseQrContent("http://192.168.1.10/login").warnings.some((w) => /IP address/.test(w)));
});

test("dangerous QR schemes are shown as text and never linked", () => {
  for (const raw of ["javascript:alert(1)", "data:text/html,<script>x</script>", "intent://scan#Intent;end", "file:///etc/passwd"]) {
    const content = parseQrContent(raw);
    assert.equal(content.kind, "text", raw);
    assert.equal(content.href, undefined, raw);
    assert.match(content.warnings[0], /scheme/, raw);
  }
  assert.equal(safeHref("javascript:alert(1)"), undefined);
  assert.equal(parseQrContent("Hello, world").kind, "text");
  assert.deepEqual(parseQrContent("Hello, world").warnings, []);
});

test("Wi-Fi, email, phone, SMS, contact, and location codes are parsed", () => {
  const wifi = parseQrContent("WIFI:T:WPA;S:Cafe\\;Guest;P:p\\:ss;H:true;;");
  assert.equal(wifi.kind, "wifi");
  assert.deepEqual(wifi.fields, [["Network (SSID)", "Cafe;Guest"], ["Security", "WPA"], ["Password", "p:ss"], ["Hidden network", "Yes"]]);
  assert.match(parseQrContent("WIFI:S:Open;T:nopass;;").warnings[0], /open network/);
  const mail = parseQrContent("mailto:hi@example.com?subject=Hello");
  assert.equal(mail.kind, "email");
  assert.deepEqual(mail.fields, [["To", "hi@example.com"], ["Subject", "Hello"]]);
  assert.equal(parseQrContent("MATMSG:TO:a@b.co;SUB:Hi;BODY:Yo;;").fields[0][1], "a@b.co");
  assert.equal(parseQrContent("tel:+1 (555) 010-9999").href, "tel:+15550109999");
  const sms = parseQrContent("SMSTO:+15550100:See you at 5");
  assert.equal(sms.kind, "sms");
  assert.equal(sms.href, "sms:+15550100?body=See%20you%20at%205");
  const card = parseQrContent("BEGIN:VCARD\nVERSION:3.0\nFN:Ada Lovelace\nORG:Analytical\nTEL;TYPE=cell:+44 20 0000\nEND:VCARD");
  assert.equal(card.kind, "contact");
  assert.deepEqual(card.fields, [["Name", "Ada Lovelace"], ["Organization", "Analytical"], ["Phone", "+44 20 0000"]]);
  assert.deepEqual(parseQrContent("MECARD:N:Doe,Jane;TEL:123;;").fields, [["Name", "Doe Jane"], ["Phone", "123"]]);
  const geo = parseQrContent("geo:48.8584,2.2945");
  assert.equal(geo.kind, "geo");
  assert.match(geo.href, /^https:\/\/www\.openstreetmap\.org\/\?mlat=48\.8584&mlon=2\.2945/);
});

const exportCode = ts.transpileModule(readFileSync(new URL("../app/trending-tools/qr-code-reader/export.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const exporter = { exports: {} };
new Function("module", "exports", "require", exportCode)(exporter, exporter.exports, () => ({}));
const { csvCell, toCsv, toJson } = exporter.exports;

test("CSV export quotes cells and neutralizes spreadsheet formulas", () => {
  assert.equal(csvCell("plain"), "plain");
  assert.equal(csvCell('a,"b"'), '"a,""b"""');
  assert.equal(csvCell("line\nbreak"), '"line\nbreak"');
  for (const formula of ["=HYPERLINK(\"x\")", "+1", "-2", "@SUM(A1)"]) assert.ok(csvCell(formula).startsWith("\"'"), formula);
  const rows = [
    { source: "a.png", raw: "https://example.com", content: parseQrContent("https://example.com") },
    { source: "w.png", raw: "WIFI:S:Home;T:WPA;P:pw;;", content: parseQrContent("WIFI:S:Home;T:WPA;P:pw;;") },
  ];
  const lines = toCsv(rows).trim().split("\r\n");
  assert.equal(lines[0], "Source,Type,Content,Link,Details,Warnings");
  assert.equal(lines[1], "a.png,Website link,https://example.com,https://example.com/,Domain: example.com,");
  assert.match(lines[2], /^w\.png,Wi‑Fi network,WIFI:S:Home;T:WPA;P:pw;;,,Network \(SSID\): Home; Security: WPA; Password: pw,$/);
  const json = JSON.parse(toJson(rows));
  assert.deepEqual(json[1], { source: "w.png", type: "wifi", content: "WIFI:S:Home;T:WPA;P:pw;;", link: null, details: { "Network (SSID)": "Home", Security: "WPA", Password: "pw" }, warnings: [] });
});

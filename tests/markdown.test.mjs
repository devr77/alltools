import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { Readable } from "node:stream";
import { EventEmitter } from "node:events";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
function load(file, mocks = {}) {
  const code = ts.transpileModule(readFileSync(new URL(`../app/${file}`, import.meta.url), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const loaded = { exports: {} };
  new Function("require", "module", "exports", code)(name => mocks[name] ?? require(name), loaded, loaded.exports);
  return loaded.exports;
}
const { validateWebUrl, isPublicAddress, htmlToMarkdown } = load("lib/webpage-markdown.ts");

test("converter rejects local, encoded, mapped and special-use addresses", () => {
  for (const address of ["127.0.0.1", "10.0.0.1", "169.254.169.254", "172.16.0.1", "192.168.0.1", "100.64.0.1", "0.0.0.0", "::1", "::ffff:127.0.0.1", "fc00::1", "fe80::1", "2002:7f00:1::", "2001:db8::1"]) {
    assert.equal(isPublicAddress(address), false, address);
  }
  for (const address of ["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"]) assert.equal(isPublicAddress(address), true);
  for (const url of ["http://127.1", "http://2130706433", "http://0x7f000001", "http://[::ffff:127.0.0.1]", "http://localhost", "file:///etc/passwd", "https://user:pass@example.com", "https://example.com:8080", "example.com"]) assert.throws(() => validateWebUrl(url));
  assert.equal(validateWebUrl(" https://example.com/path ").href, "https://example.com/path");
});

test("HTML conversion preserves structure and resolves links while removing executable content", () => {
  const markdown = htmlToMarkdown('<html><body><nav>Menu</nav><main><h1>Test page</h1><p>Hello <strong>world</strong>.</p><a href="../guide">Guide</a><img src="/photo.png" alt="Photo"><a href="javascript:alert(1)">Unsafe</a><script>alert(1)</script><style>body{}</style></main></body></html>', "https://example.com/docs/page");
  assert.match(markdown, /# Test page/);
  assert.match(markdown, /Hello \*\*world\*\*/);
  assert.match(markdown, /\[Guide\]\(https:\/\/example.com\/guide\)/);
  assert.match(markdown, /!\[Photo\]\(https:\/\/example.com\/photo.png\)/);
  assert.doesNotMatch(markdown, /javascript:|alert\(1\)|Menu|body\{/);
  assert.throws(() => htmlToMarkdown("<html><body><script>x</script></body></html>", "https://example.com"), /No readable content/);
});

function fakeFetcher(pages, addresses = [{ address: "93.184.215.14", family: 4 }]) {
  const seen = [];
  function request(url, options, callback) {
    const req = new EventEmitter();
    req.end = () => queueMicrotask(() => {
      options.lookup(url.hostname, { all: true }, (error, pinned) => {
        assert.ifError(error);
        assert.deepEqual(pinned, addresses);
      });
      seen.push(url.href);
      const page = pages[seen.length - 1];
      const response = Readable.from(page.chunks ?? [Buffer.from(page.body ?? "<h1>Example</h1>")]);
      response.statusCode = page.status ?? 200;
      response.headers = page.headers ?? { "content-type": "text/html" };
      callback(response);
    });
    return req;
  }
  const loaded = load("lib/webpage-markdown.ts", {
    "node:dns/promises": { lookup: async () => addresses },
    "node:http": { request }, "node:https": { request },
  });
  return { fetch: loaded.fetchPublicHtml, seen };
}

test("public fetch pins DNS and resolves relative redirects", async () => {
  const client = fakeFetcher([{ status: 302, headers: { location: "/article" } }, { body: "<h1>Article</h1>" }]);
  assert.deepEqual(await client.fetch("https://example.com/start"), { html: "<h1>Article</h1>", url: "https://example.com/article" });
  assert.deepEqual(client.seen, ["https://example.com/start", "https://example.com/article"]);
});

test("public fetch blocks private DNS answers and redirect targets", async () => {
  const privateDns = fakeFetcher([], [{ address: "127.0.0.1", family: 4 }]);
  await assert.rejects(privateDns.fetch("https://example.com"), /Only public/);
  assert.deepEqual(privateDns.seen, []);
  const redirect = fakeFetcher([{ status: 302, headers: { location: "http://169.254.169.254/latest/meta-data/" } }]);
  await assert.rejects(redirect.fetch("https://example.com"), /Only public/);
  assert.equal(redirect.seen.length, 1);
});

test("public fetch handles upstream errors, non-HTML, large streams and redirect loops", async () => {
  await assert.rejects(fakeFetcher([{ status: 403 }]).fetch("https://example.com"), /HTTP 403/);
  await assert.rejects(fakeFetcher([{ headers: { "content-type": "application/pdf" } }]).fetch("https://example.com"), /HTML webpage/);
  await assert.rejects(fakeFetcher([{ chunks: [Buffer.alloc(2 * 1024 * 1024), Buffer.from("x")] }]).fetch("https://example.com"), /too large/);
  await assert.rejects(fakeFetcher(Array(6).fill({ status: 301, headers: { location: "/loop" } })).fetch("https://example.com"), /redirected too many/);
});

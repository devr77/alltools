import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const compiled = ts.transpileModule(readFileSync(new URL("../app/api/ai-gen/route.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;

function handler(fetchImpl, env = { NEXT_GROQ_KEY: "test-key" }) {
  const loaded = { exports: {} };
  new Function("exports", "process", "fetch", compiled)(loaded.exports, { env }, fetchImpl);
  return loaded.exports.POST;
}
function request(body, raw = false) {
  return new Request("http://localhost/api/ai-gen", { method: "POST", headers: { "Content-Type": "application/json" }, body: raw ? body : JSON.stringify(body) });
}
async function expectError(response, status, message) {
  assert.equal(response.status, status);
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.match((await response.json()).error, message);
}

test("AI endpoint rejects malformed, empty, oversized and incorrectly typed inputs without calling Groq", async () => {
  const post = handler(() => assert.fail("Invalid input must not call the provider"));
  for (const body of [null, [], 1, {}, { prompt: "   " }, { prompt: 42 }, { prompt: "x".repeat(12001) }, { prompt: "Hi", masterprompt: {} }, { prompt: "Hi", masterprompt: "x".repeat(4001) }]) {
    await expectError(await post(request(body)), 400, /prompt|object/i);
  }
  await expectError(await post(request("{broken", true)), 400, /valid JSON/);
});

test("AI endpoint supports the existing key and working default model", async () => {
  const post = handler(async (url, options) => {
    assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
    assert.equal(options.headers.Authorization, "Bearer test-key");
    const body = JSON.parse(options.body);
    assert.equal(body.model, "openai/gpt-oss-20b");
    assert.deepEqual(body.messages, [{ role: "system", content: "Be brief." }, { role: "user", content: "Hello" }]);
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ choices: [{ message: { content: " Hi! " } }] });
  });
  const response = await post(request({ prompt: " Hello ", masterprompt: " Be brief. " }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { content: "Hi!" });
});

test("standard key and configurable model take precedence; missing keys give an actionable error", async () => {
  const post = handler(async (_url, options) => {
    assert.equal(options.headers.Authorization, "Bearer preferred-key");
    assert.equal(JSON.parse(options.body).model, "custom-model");
    return Response.json({ choices: [{ message: { content: "OK" } }] });
  }, { GROQ_API_KEY: " preferred-key ", NEXT_GROQ_KEY: "legacy-key", GROQ_MODEL: " custom-model " });
  assert.equal((await post(request({ prompt: "Hello" }))).status, 200);
  await expectError(await handler(() => assert.fail("No key"), {})(request({ prompt: "Hello" })), 503, /GROQ_API_KEY.*NEXT_GROQ_KEY/);
});

test("provider model/access/rate-limit failures return useful errors without leaking upstream details", async () => {
  for (const [status, code, expected, message] of [
    [404, "model_not_found", 503, /GROQ_MODEL/],
    [400, "model_decommissioned", 503, /GROQ_MODEL/],
    [401, "invalid_api_key", 503, /credentials/],
    [403, "access_denied", 503, /permissions/],
    [429, "rate_limit_exceeded", 429, /usage limit/],
    [500, "internal_error", 502, /could not complete/],
  ]) {
    const post = handler(async () => Response.json({ error: { code, message: "sensitive-provider-detail" } }, { status }));
    const response = await post(request({ prompt: "Hello" }));
    assert.doesNotMatch(await response.clone().text(), /sensitive-provider-detail/);
    await expectError(response, expected, message);
  }
});

test("network failures, timeouts, non-JSON and empty provider output remain JSON errors", async () => {
  for (const [fetchImpl, status, message] of [
    [async () => { throw new TypeError("fetch failed"); }, 502, /connect/],
    [async () => { throw new DOMException("Timed out", "TimeoutError"); }, 504, /too long/],
    [async () => new Response("<html>Bad gateway</html>", { status: 502 }), 502, /could not complete/],
    [async () => new Response("not JSON"), 502, /empty response/],
    [async () => Response.json({ choices: [{ message: { content: " " } }] }), 502, /empty response/],
    [async () => Response.json({ choices: [{ message: { content: 42 } }] }), 502, /empty response/],
  ]) await expectError(await handler(fetchImpl)(request({ prompt: "Hello" })), status, message);
});

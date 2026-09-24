import { parseHTML } from "linkedom";
import TurndownService from "turndown";

// Runs on the Edge runtime (Cloudflare Pages), so only Web APIs are available here.
// Workers cannot reach private networks, which covers hostnames that resolve to
// internal addresses; literal IPs and redirect targets are still validated below.
const MAX_BYTES = 2 * 1024 * 1024;

type Range = readonly [bigint, number];
const v4 = (address: string) => {
  const parts = address.split(".");
  if (parts.length !== 4 || !parts.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255)) return null;
  return parts.reduce((value, part) => (value << BigInt(8)) | BigInt(part), BigInt(0));
};
const v6 = (address: string) => {
  let text = address.toLowerCase();
  const tail = text.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
  if (tail) {
    const ipv4 = v4(tail[2]);
    if (ipv4 === null) return null;
    text = `${tail[1]}${(ipv4 >> BigInt(16)).toString(16)}:${(ipv4 & BigInt(0xffff)).toString(16)}`;
  }
  const halves = text.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const rest = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - rest.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;
  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill("0"), ...rest];
  if (!groups.every(group => /^[0-9a-f]{1,4}$/.test(group))) return null;
  return groups.reduce((value, group) => (value << BigInt(16)) | BigInt(parseInt(group, 16)), BigInt(0));
};
const inRange = (value: bigint, bits: number, [base, prefix]: Range) =>
  value >> BigInt(bits - prefix) === base >> BigInt(bits - prefix);
const blockedV4 = ([
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10],
  ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12],
  ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.168.0.0", 16],
  ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const).map(([address, prefix]): Range => [v4(address)!, prefix]);
const blockedV6 = ([["2001::", 23], ["2001:db8::", 32], ["2002::", 16], ["3fff::", 20]] as const)
  .map(([address, prefix]): Range => [v6(address)!, prefix]);
const globalV6: Range = [v6("2000::")!, 3];

export class ConversionError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function isPublicAddress(address: string): boolean {
  const ipv4 = v4(address);
  if (ipv4 !== null) return !blockedV4.some(range => inRange(ipv4, 32, range));
  const ipv6 = v6(address);
  return ipv6 !== null && inRange(ipv6, 128, globalV6) && !blockedV6.some(range => inRange(ipv6, 128, range));
}

export function validateWebUrl(input: unknown): URL {
  if (typeof input !== "string" || input.length > 4096) throw new ConversionError("Enter a valid public HTTP or HTTPS URL.");
  let url: URL;
  try { url = new URL(input.trim()); } catch { throw new ConversionError("Enter a complete URL, such as https://example.com."); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.port) {
    throw new ConversionError("Use a public HTTP or HTTPS URL on its standard port, without credentials.");
  }
  // The URL parser normalises shorthand IPv4 (127.1, 0x7f000001, ...) to dotted form.
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const literal = v4(host) !== null || v6(host) !== null;
  if (host === "localhost" || host.endsWith(".localhost") || (literal && !isPublicAddress(host))) {
    throw new ConversionError("Only public websites can be converted.");
  }
  return url;
}

async function readLimited(body: ReadableStream<Uint8Array>): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0, html = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return html + decoder.decode();
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) throw new ConversionError("This webpage is too large (maximum 2 MB).", 413);
      html += decoder.decode(value, { stream: true });
    }
  } finally { reader.cancel().catch(() => {}); }
}

export async function fetchPublicHtml(input: unknown): Promise<{ html: string; url: string }> {
  const signal = AbortSignal.timeout(15000);
  let url = validateWebUrl(input);
  for (let redirects = 0; redirects <= 5; redirects++) {
    const response = await fetch(url, {
      signal,
      redirect: "manual",
      headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": "ToolsBase-WebpageConverter/1.0" },
    });
    const { status } = response;
    if ([301, 302, 303, 307, 308].includes(status)) {
      response.body?.cancel().catch(() => {});
      const location = response.headers.get("location");
      if (!location || redirects === 5) throw new ConversionError("The website redirected too many times or supplied an invalid redirect.", 502);
      url = validateWebUrl(new URL(location, url).href);
      continue;
    }
    try {
      if (status < 200 || status >= 300) throw new ConversionError(`The website returned HTTP ${status}. Try another public page.`, 502);
      if (!/^(text\/html|application\/xhtml\+xml)(;|$)/i.test(response.headers.get("content-type") ?? "")) {
        throw new ConversionError("This URL does not return an HTML webpage.", 422);
      }
      if (Number(response.headers.get("content-length")) > MAX_BYTES) throw new ConversionError("This webpage is too large (maximum 2 MB).", 413);
      return { html: response.body ? await readLimited(response.body) : "", url: url.href };
    } finally { response.body?.cancel().catch(() => {}); }
  }
  throw new ConversionError("Could not retrieve this webpage.", 502);
}

export function htmlToMarkdown(html: string, sourceUrl: string): string {
  const { document } = parseHTML(html);
  document.querySelectorAll("script,style,noscript,iframe,object,embed,svg,form,nav,footer,header").forEach(node => node.remove());
  for (const node of document.querySelectorAll("a[href],img[src]")) {
    const attribute = node.tagName === "A" ? "href" : "src";
    try {
      const url = new URL(node.getAttribute(attribute) ?? "", sourceUrl);
      if (["http:", "https:", ...(attribute === "href" ? ["mailto:", "tel:"] : [])].includes(url.protocol)) node.setAttribute(attribute, url.href);
      else node.removeAttribute(attribute);
    } catch { node.removeAttribute(attribute); }
  }
  const content = document.querySelector("main") ?? document.querySelector("article") ?? document.body;
  const converter = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
  // Pass the parsed node rather than an HTML string: Turndown's browser build (picked
  // on the Edge runtime) has no HTML parser of its own without a global DOMParser.
  const markdown = converter.turndown(content as unknown as TurndownService.Node).trim();
  if (!markdown) throw new ConversionError("No readable content was found. Pages requiring JavaScript or a login may not be supported.", 422);
  return markdown;
}

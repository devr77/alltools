import { lookup } from "node:dns/promises";
import { request as httpRequest, type IncomingMessage } from "node:http";
import { request as httpsRequest } from "node:https";
import { BlockList, isIP } from "node:net";
import { parseHTML } from "linkedom";
import TurndownService from "turndown";

const MAX_BYTES = 2 * 1024 * 1024;
const blocked = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10],
  ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12],
  ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.168.0.0", 16],
  ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const) blocked.addSubnet(address, prefix, "ipv4");
for (const [address, prefix] of [["2001::", 23], ["2001:db8::", 32], ["2002::", 16], ["3fff::", 20]] as const) {
  blocked.addSubnet(address, prefix, "ipv6");
}
const globalV6 = new BlockList();
globalV6.addSubnet("2000::", 3, "ipv6");

export class ConversionError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !blocked.check(address, "ipv4");
  return family === 6 && globalV6.check(address, "ipv6") && !blocked.check(address, "ipv6");
}

export function validateWebUrl(input: unknown): URL {
  if (typeof input !== "string" || input.length > 4096) throw new ConversionError("Enter a valid public HTTP or HTTPS URL.");
  let url: URL;
  try { url = new URL(input.trim()); } catch { throw new ConversionError("Enter a complete URL, such as https://example.com."); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.port) {
    throw new ConversionError("Use a public HTTP or HTTPS URL on its standard port, without credentials.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || (isIP(host) && !isPublicAddress(host))) {
    throw new ConversionError("Only public websites can be converted.");
  }
  return url;
}

async function openPage(url: URL, signal: AbortSignal): Promise<IncomingMessage> {
  const host = url.hostname.replace(/^\[|\]$/g, "");
  signal.throwIfAborted();
  const addresses = isIP(host) ? [{ address: host, family: isIP(host) }] : await new Promise<Awaited<ReturnType<typeof lookup>>[]>((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener("abort", abort, { once: true });
    lookup(host, { all: true }).then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
  });
  signal.throwIfAborted();
  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new ConversionError("Only public websites can be converted.");
  }
  // Pin the checked DNS answers to the actual connection, preventing DNS rebinding.
  return new Promise((resolve, reject) => {
    const request = (url.protocol === "https:" ? httpsRequest : httpRequest)(url, {
      signal,
      agent: false,
      lookup: (_hostname, options, callback) => {
        if (options.all) callback(null, addresses);
        else callback(null, addresses[0].address, addresses[0].family);
      },
      headers: { Accept: "text/html,application/xhtml+xml", "Accept-Encoding": "identity", "User-Agent": "ToolsBase-WebpageConverter/1.0" },
    }, resolve);
    request.on("error", reject);
    request.end();
  });
}

export async function fetchPublicHtml(input: unknown): Promise<{ html: string; url: string }> {
  const signal = AbortSignal.timeout(15000);
  let url = validateWebUrl(input);
  for (let redirects = 0; redirects <= 5; redirects++) {
    const response = await openPage(url, signal);
    const status = response.statusCode ?? 502;
    if ([301, 302, 303, 307, 308].includes(status)) {
      response.destroy();
      if (!response.headers.location || redirects === 5) throw new ConversionError("The website redirected too many times or supplied an invalid redirect.", 502);
      url = validateWebUrl(new URL(response.headers.location, url).href);
      continue;
    }
    try {
      if (status < 200 || status >= 300) throw new ConversionError(`The website returned HTTP ${status}. Try another public page.`, 502);
      if (!/^(text\/html|application\/xhtml\+xml)(;|$)/i.test(response.headers["content-type"] ?? "")) {
        throw new ConversionError("This URL does not return an HTML webpage.", 422);
      }
      if (Number(response.headers["content-length"]) > MAX_BYTES) throw new ConversionError("This webpage is too large (maximum 2 MB).", 413);
      const chunks: Buffer[] = [];
      let bytes = 0;
      for await (const chunk of response) {
        bytes += chunk.length;
        if (bytes > MAX_BYTES) throw new ConversionError("This webpage is too large (maximum 2 MB).", 413);
        chunks.push(Buffer.from(chunk));
      }
      return { html: Buffer.concat(chunks).toString("utf8"), url: url.href };
    } finally { response.destroy(); }
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
  const markdown = converter.turndown(content.innerHTML).trim();
  if (!markdown) throw new ConversionError("No readable content was found. Pages requiring JavaScript or a login may not be supported.", 422);
  return markdown;
}

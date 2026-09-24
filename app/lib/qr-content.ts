/**
 * Interprets decoded QR text (pure; covered by tests/qr.test.mjs). Shared by the QR Code Reader and /share/qr-code-to-url.
 * Only http(s), mailto, tel, and sms become clickable. Anything else (javascript:, data:, intent:, file:, …) is shown
 * as text, so a malicious code cannot run script or open an app from this page.
 */

export type QrField = [label: string, value: string];
export type QrContent = {
  kind: "url" | "wifi" | "email" | "phone" | "sms" | "contact" | "geo" | "text";
  label: string;
  /** Safe link to open, when there is one. */
  href?: string;
  fields: QrField[];
  /** Cautions shown with the result, e.g. an insecure link or a lookalike domain. */
  warnings: string[];
};

const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:", "sms:"]);

export function safeHref(value: string) {
  try {
    const url = new URL(value.trim());
    return SAFE_SCHEMES.has(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/** Splits WIFI:/MECARD: style "K:value;" pairs, honoring backslash escapes (\; \: \, \\). */
export function parsePairs(body: string) {
  const pairs: Record<string, string> = {};
  let key = "", value = "", inValue = false;
  for (let index = 0; index < body.length; index++) {
    const char = body[index];
    if (char === "\\" && index + 1 < body.length) {
      const escaped = body[++index];
      if (inValue) value += escaped; else key += escaped;
      continue;
    }
    if (!inValue && char === ":") { inValue = true; continue; }
    if (inValue && char === ";") { if (key) pairs[key.toUpperCase()] = value; key = ""; value = ""; inValue = false; continue; }
    if (inValue) value += char; else key += char;
  }
  if (key && inValue) pairs[key.toUpperCase()] = value;
  return pairs;
}

function urlWarnings(href: string) {
  const url = new URL(href);
  const warnings: string[] = [];
  if (url.protocol === "http:") warnings.push("This link isn't encrypted (http, not https). Avoid entering passwords or payment details on it.");
  if (url.hostname.startsWith("xn--") || url.hostname.includes(".xn--")) warnings.push("The address uses international characters, which can imitate a familiar site. Check the domain carefully.");
  if (url.username || url.password) warnings.push("The link contains a username or password before the domain, a trick sometimes used to disguise the real site.");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname)) warnings.push("The link points to a bare IP address rather than a domain name.");
  return warnings;
}

function vcardFields(text: string): QrField[] {
  const fields: QrField[] = [];
  const names: Record<string, string> = { FN: "Name", ORG: "Organization", TITLE: "Title", TEL: "Phone", EMAIL: "Email", URL: "Website", ADR: "Address", NOTE: "Note" };
  for (const line of text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/)) {
    const match = /^([A-Z-]+)(?:;[^:]*)?:(.*)$/i.exec(line.trim());
    const label = match && names[match[1].toUpperCase()];
    if (label && match[2].trim()) fields.push([label, match[2].replace(/;+/g, " ").replace(/\\,/g, ",").trim()]);
  }
  return fields;
}

export function parseQrContent(raw: string): QrContent {
  const text = raw.trim();
  const upper = text.toUpperCase();

  if (upper.startsWith("WIFI:")) {
    const pairs = parsePairs(text.slice(5));
    const security = (pairs.T || "").toUpperCase();
    const fields: QrField[] = [["Network (SSID)", pairs.S || ""], ["Security", security === "NOPASS" || !security ? "None (open network)" : security]];
    if (pairs.P) fields.push(["Password", pairs.P]);
    if (pairs.H === "true") fields.push(["Hidden network", "Yes"]);
    return { kind: "wifi", label: "Wi‑Fi network", fields, warnings: security === "NOPASS" || !security ? ["This is an open network. Traffic on it can be seen by others nearby."] : [] };
  }
  if (upper.startsWith("MATMSG:")) {
    const pairs = parsePairs(text.slice(7));
    const href = pairs.TO ? safeHref(`mailto:${encodeURIComponent(pairs.TO)}?subject=${encodeURIComponent(pairs.SUB || "")}&body=${encodeURIComponent(pairs.BODY || "")}`) : undefined;
    return { kind: "email", label: "Email", href, fields: [["To", pairs.TO || ""], ["Subject", pairs.SUB || ""], ["Message", pairs.BODY || ""]].filter(([, value]) => value) as QrField[], warnings: [] };
  }
  if (upper.startsWith("MAILTO:")) {
    const href = safeHref(text);
    const url = href ? new URL(href) : null;
    const fields: QrField[] = [["To", decodeURIComponent(url?.pathname || text.slice(7))]];
    if (url?.searchParams.get("subject")) fields.push(["Subject", url.searchParams.get("subject")]);
    if (url?.searchParams.get("body")) fields.push(["Message", url.searchParams.get("body")]);
    return { kind: "email", label: "Email", href, fields, warnings: [] };
  }
  if (upper.startsWith("TEL:")) {
    const number = text.slice(4).trim();
    return { kind: "phone", label: "Phone number", href: safeHref(`tel:${number.replace(/[^\d+#*]/g, "")}`), fields: [["Number", number]], warnings: [] };
  }
  if (upper.startsWith("SMSTO:") || upper.startsWith("SMS:")) {
    const rest = text.slice(text.indexOf(":") + 1);
    const [number, ...message] = rest.split(":");
    const body = message.join(":");
    const fields: QrField[] = [["To", number.split("?")[0]]];
    if (body) fields.push(["Message", body]);
    return { kind: "sms", label: "Text message", href: safeHref(`sms:${number.split("?")[0].replace(/[^\d+]/g, "")}${body ? `?body=${encodeURIComponent(body)}` : ""}`), fields, warnings: [] };
  }
  if (upper.startsWith("BEGIN:VCARD")) {
    return { kind: "contact", label: "Contact card", fields: vcardFields(text), warnings: [] };
  }
  if (upper.startsWith("MECARD:")) {
    const pairs = parsePairs(text.slice(7));
    const fields = ([["Name", pairs.N?.replace(",", " ")], ["Phone", pairs.TEL], ["Email", pairs.EMAIL], ["Website", pairs.URL], ["Address", pairs.ADR], ["Note", pairs.NOTE]] as [string, string | undefined][])
      .filter(([, value]) => value) as QrField[];
    return { kind: "contact", label: "Contact card", fields, warnings: [] };
  }
  const geo = /^geo:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i.exec(text);
  if (geo) {
    const [lat, lon] = [geo[1], geo[2]];
    return { kind: "geo", label: "Location", href: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`, fields: [["Latitude", lat], ["Longitude", lon]], warnings: [] };
  }

  // Bare domains ("example.com/path") are common on printed codes; treat them as https links.
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : /^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(text) ? `https://${text}` : "";
  const href = candidate && /^https?:/i.test(candidate) ? safeHref(candidate) : undefined;
  if (href) {
    const url = new URL(href);
    return { kind: "url", label: "Website link", href, fields: [["Domain", url.hostname]], warnings: urlWarnings(href) };
  }
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(text)?.[1]?.toLowerCase();
  const warnings = scheme && !["http", "https"].includes(scheme)
    ? [`This code uses the “${scheme}:” scheme, which can open an app or run code. It is shown as text and not opened.`] : [];
  return { kind: "text", label: "Text", fields: [], warnings };
}

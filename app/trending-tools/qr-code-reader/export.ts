/** CSV/JSON export of decoded QR results (pure; covered by tests/qr.test.mjs). */
import type { QrContent } from "../../lib/qr-content";

export type DecodedQr = { source: string; raw: string; content: QrContent };

/** Quotes a CSV cell and neutralizes spreadsheet formulas, since QR contents are untrusted input. */
export function csvCell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) || safe !== value ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(rows: DecodedQr[]) {
  const header = ["Source", "Type", "Content", "Link", "Details", "Warnings"];
  const lines = rows.map(({ source, raw, content }) => [
    source,
    content.label,
    raw,
    content.href || "",
    content.fields.map(([label, value]) => `${label}: ${value}`).join("; "),
    content.warnings.join(" "),
  ].map(csvCell).join(","));
  return [header.join(","), ...lines].join("\r\n") + "\r\n";
}

export function toJson(rows: DecodedQr[]) {
  return JSON.stringify(rows.map(({ source, raw, content }) => ({
    source,
    type: content.kind,
    content: raw,
    link: content.href ?? null,
    details: Object.fromEntries(content.fields),
    warnings: content.warnings,
  })), null, 2);
}

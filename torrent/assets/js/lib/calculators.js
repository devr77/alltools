/** Pure comparison and naming functions for the torrent calculator tools. */
function ensureRange(...values) {
    if (values.some((value) => !Number.isFinite(value)))
        throw new Error("The result is outside the supported number range. Use smaller input values.");
}
export function parseMeasurements(text) {
    const values = text.trim().split(/[\s,;]+/).map(Number);
    if (values.length < 3 || values.length > 20 || values.some((value) => !Number.isFinite(value) || value <= 0))
        throw new Error("Provide 3–20 positive Mbps measurements for each test, separated by commas.");
    return values;
}
function median(values) { const sorted = [...values].sort((a, b) => a - b); const mid = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2; }
export function compareConnections(direct, vpn, reference) {
    const d = median(parseMeasurements(direct)), v = median(parseMeasurements(vpn)), r = median(parseMeasurements(reference));
    const improvement = (v / d - 1) * 100;
    ensureRange(improvement, d / r * 100);
    return { directMbps: d, vpnMbps: v, referenceMbps: r, improvement, utilization: d / r * 100, interpretation: improvement >= 50 ? "VPN measurements are substantially faster. Repeat with the same well-seeded torrent at different times; this difference alone does not prove throttling." : improvement <= -20 ? "VPN measurements are slower. VPN overhead or routing may be limiting throughput; these measurements do not establish throttling." : "These measurements show no strong VPN advantage. They cannot rule out intermittent or protocol-specific throttling." };
}
export function standardName(title, year, type, season, episode, resolution, source, codec, group) {
    const clean = (value) => value.trim().normalize("NFKC").replace(/[<>:"/\\|?*\x00-\x1f]/g, "").replace(/[\s._]+/g, ".").replace(/^\.+|\.+$/g, "");
    const base = clean(title);
    if (!base)
        throw new Error("Enter a title with usable filename characters.");
    if (year && !/^(19|20|21)\d{2}$/.test(year))
        throw new Error("Enter a four-digit year between 1900 and 2199, or leave it blank.");
    if (type === "tv" && (![season, episode].every((n) => Number.isInteger(n) && n >= 0 && n <= 999)))
        throw new Error("Season and episode must be whole numbers from 0 to 999.");
    const code = type === "tv" ? `S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}` : "";
    const name = [base, year, code, resolution, source, codec].map(clean).filter(Boolean).join(".") + (clean(group) ? `-${clean(group)}` : "");
    if (name.length > 220)
        throw new Error("Shorten the title or tags to keep the name under 220 characters.");
    return name;
}

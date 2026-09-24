/** Pure calculator and naming functions for the torrent calculator tools. */
export const sizeUnits = { MB: 1e6, GB: 1e9, TB: 1e12, MiB: 1024 ** 2, GiB: 1024 ** 3, TiB: 1024 ** 4 };
export const speedUnits = { Mbps: 1e6 / 8, Gbps: 1e9 / 8, "MB/s": 1e6, "MiB/s": 1024 ** 2 };
function finite(value, name, min = 0) {
    if (!Number.isFinite(value) || value < min)
        throw new Error(`${name} must be ${min > 0 ? "greater than zero" : "zero or greater"}.`);
    return value;
}
function ensureRange(...values) {
    if (values.some((value) => !Number.isFinite(value)))
        throw new Error("The result is outside the supported number range. Use smaller input values.");
}
export function downloadEstimate(size, unit, speed, speedUnit, efficiency, completed = 0) {
    finite(size, "File size", Number.MIN_VALUE);
    finite(speed, "Speed", Number.MIN_VALUE);
    finite(efficiency, "Efficiency", Number.MIN_VALUE);
    finite(completed, "Completed percentage");
    if (efficiency > 100 || completed > 100)
        throw new Error("Percentages cannot exceed 100.");
    const bytes = size * sizeUnits[unit];
    const bytesPerSecond = speed * speedUnits[speedUnit] * efficiency / 100;
    ensureRange(bytes, bytesPerSecond, bytes / bytesPerSecond);
    return { bytes, bytesPerSecond, remainingBytes: bytes * (1 - completed / 100), seconds: bytes * (1 - completed / 100) / bytesPerSecond };
}
export function speedEstimate(speed, unit, efficiency) {
    const { bytesPerSecond } = downloadEstimate(1, "GB", speed, unit, efficiency);
    ensureRange(bytesPerSecond * 3600);
    return { megabytes: bytesPerSecond / 1e6, mebibytes: bytesPerSecond / 1024 ** 2, gigabytesPerHour: bytesPerSecond * 3600 / 1e9 };
}
export function videoEstimate(minutes, videoMbps, audioKbps, originalGB, overhead) {
    finite(minutes, "Duration", Number.MIN_VALUE);
    finite(videoMbps, "Video bitrate", Number.MIN_VALUE);
    finite(audioKbps, "Audio bitrate");
    finite(originalGB, "Original size", Number.MIN_VALUE);
    finite(overhead, "Container overhead");
    if (overhead > 100)
        throw new Error("Overhead cannot exceed 100%.");
    const bytes = minutes * 60 * (videoMbps * 1e6 + audioKbps * 1000) / 8 * (1 + overhead / 100);
    ensureRange(bytes, originalGB * 1e9, bytes / (originalGB * 1e9));
    return { bytes, savedBytes: originalGB * 1e9 - bytes, reductionPercent: (1 - bytes / (originalGB * 1e9)) * 100 };
}
export function storageEstimate(sizeGB, expansion, copies, headroom, monthlyPrice) {
    finite(sizeGB, "Download size", Number.MIN_VALUE);
    finite(expansion, "Expansion multiplier");
    finite(copies, "Backup copies");
    finite(headroom, "Headroom");
    finite(monthlyPrice, "Monthly price");
    if (!Number.isInteger(copies) || copies > 100)
        throw new Error("Backup copies must be a whole number from 0 to 100.");
    if (headroom > 100)
        throw new Error("Headroom cannot exceed 100%.");
    const originalAndExtractedGB = sizeGB * (1 + expansion);
    const backupGB = originalAndExtractedGB * copies;
    const totalGB = (originalAndExtractedGB + backupGB) * (1 + headroom / 100);
    ensureRange(totalGB, totalGB * monthlyPrice);
    return { originalAndExtractedGB, backupGB, totalGB, monthlyCost: totalGB * monthlyPrice };
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
export function durationLabel(seconds) {
    if (seconds === 0)
        return "Complete";
    if (!Number.isFinite(seconds) || seconds < 0)
        throw new Error("Duration is outside the supported range.");
    if (seconds < 1)
        return "Less than a second";
    let remainder = Math.ceil(seconds);
    const days = Math.floor(remainder / 86400);
    remainder %= 86400;
    const hours = Math.floor(remainder / 3600);
    remainder %= 3600;
    const minutes = Math.floor(remainder / 60);
    remainder %= 60;
    return [days ? `${days}d` : "", hours ? `${hours}h` : "", minutes ? `${minutes}m` : "", `${remainder}s`].filter(Boolean).join(" ");
}

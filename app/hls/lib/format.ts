/** Display helpers shared by the HLS tools. */

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1000)), units.length - 1);
  const value = bytes / 1000 ** power;
  return `${value >= 100 || power === 0 ? Math.round(value) : value.toFixed(1)} ${units[power]}`;
}

/** 3725.4 -> "1:02:05"; 65 -> "1:05". */
export function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "–";
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
}

export function formatBitrate(bitsPerSecond: number) {
  if (!bitsPerSecond) return "–";
  return bitsPerSecond >= 1e6 ? `${(bitsPerSecond / 1e6).toFixed(1)} Mbps` : `${Math.round(bitsPerSecond / 1e3)} kbps`;
}

/** A safe file name from user input or the stream URL: "https://cdn/x/master.m3u8" -> "master". */
export function fileBase(input: string, url = "") {
  const fromUrl = (() => {
    try {
      const parts = new URL(url).pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part).replace(/\.m3u8?$/i, ""));
      // Generic names (index, master, playlist) say less than the folder they sit in.
      const generic = /^(index|master|playlist|prog_index|chunklist.*|manifest|video|stream|media.*)$/i;
      return [...parts].reverse().find((part) => !generic.test(part)) || parts.at(-1) || "";
    } catch { return ""; }
  })();
  const name = (input.trim() || fromUrl || "video").replace(/\.(mp4|ts|aac|m4a|mp3)$/i, "");
  return name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "-").replace(/\s+/g, " ").replace(/^[.\s-]+|[.\s-]+$/g, "").slice(0, 120) || "video";
}

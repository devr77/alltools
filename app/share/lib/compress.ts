/**
 * In-browser size reduction before upload.
 * Images: decoded, scaled so the longest side fits `maxDimension`, and re-encoded as WebP (JPEG where the browser
 * cannot encode WebP and the image is opaque). Re-encoding drops EXIF/GPS metadata. The original is kept whenever
 * the result is not meaningfully smaller, the format is animated or vector, or the browser cannot decode it.
 * JSON: minified (lossless).
 * The decision helpers are pure and covered by tests/share-upload.test.mjs.
 */

export type ImagePreset = { maxDimension: number; quality: number };

/** Photos: 2560 px is sharper than most screens need. Screenshots keep more pixels and quality so text stays legible. */
export const PRESETS: Record<"photo" | "screenshot", ImagePreset> = {
  photo: { maxDimension: 2560, quality: 0.82 },
  screenshot: { maxDimension: 3840, quality: 0.92 },
};

/** Keep the compressed version only when it saves at least this share of the original size. */
export const MIN_SAVING = 0.05;

// GIF and APNG-capable types would lose animation; SVG is vector; HEIC/AVIF/TIFF decode support varies (tried, not required).
const RECOMPRESSIBLE = new Set(["image/jpeg", "image/png", "image/webp", "image/bmp", "image/heic", "image/heif", "image/avif", "image/tiff"]);

export function canCompressImage(type: string) {
  return RECOMPRESSIBLE.has(type);
}

/**
 * Animated WebP (VP8X header with the animation flag) and APNG (an acTL chunk before the first IDAT) would lose
 * their animation on a canvas, so they are uploaded unchanged. `bytes` is the start of the file (64 KiB is plenty).
 */
export function isAnimated(bytes: Uint8Array, type: string) {
  const ascii = (at: number, text: string) => [...text].every((char, index) => bytes[at + index] === char.charCodeAt(0));
  if (type === "image/webp") return ascii(0, "RIFF") && ascii(8, "WEBP") && ascii(12, "VP8X") && (bytes[20] & 0x02) !== 0;
  if (type === "image/png") {
    // Walk PNG chunks: 8-byte signature, then [length(4) type(4) data crc(4)].
    let offset = 8;
    while (offset + 8 <= bytes.length) {
      const length = ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
      if (ascii(offset + 4, "acTL")) return true;
      if (ascii(offset + 4, "IDAT")) return false;
      offset += 12 + length;
    }
  }
  return false;
}

/** Scaled dimensions that fit inside maxDimension on the longest side, never upscaled. */
export function fitWithin(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** Whether a candidate output is worth using over the original. */
export function isWorthwhile(originalSize: number, compressedSize: number) {
  return compressedSize > 0 && compressedSize <= originalSize * (1 - MIN_SAVING);
}

/** "photo.png" + "image/webp" → "photo.webp". */
export function renameForType(name: string, type: string) {
  const ext = type === "image/webp" ? "webp" : type === "image/jpeg" ? "jpg" : "";
  if (!ext) return name;
  const base = name.replace(/\.[a-z0-9]{1,8}$/i, "") || "image";
  return `${base}.${ext}`;
}

/** Minified JSON if it is smaller, else the input. Throws on invalid JSON. */
export function minifyJson(text: string) {
  const minified = JSON.stringify(JSON.parse(text));
  return minified.length < text.length ? minified : text;
}

export type CompressResult = { blob: Blob; type: string; name: string; originalSize: number; changed: boolean };

/* ---------- Browser only ---------- */

function encode(canvas: HTMLCanvasElement | OffscreenCanvas, type: string, quality: number): Promise<Blob | null> {
  if ("convertToBlob" in canvas) return canvas.convertToBlob({ type, quality }).catch(() => null);
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Detects any non-opaque pixel on a small downscaled copy (cheap; alpha decides whether JPEG is allowed). */
function hasTransparency(bitmap: ImageBitmap) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return true;
  context.drawImage(bitmap, 0, 0, size, size);
  const { data } = context.getImageData(0, 0, size, size);
  for (let index = 3; index < data.length; index += 4) if (data[index] < 255) return true;
  return false;
}

export async function compressImage(file: Blob & { name?: string }, type: string, preset: ImagePreset): Promise<CompressResult> {
  const name = file.name || "image";
  const original: CompressResult = { blob: file, type, name, originalSize: file.size, changed: false };
  if (!canCompressImage(type) || typeof createImageBitmap !== "function") return original;
  if (isAnimated(new Uint8Array(await file.slice(0, 65536).arrayBuffer()), type)) return original;

  let bitmap: ImageBitmap;
  try {
    // "from-image" applies EXIF orientation, so rotated phone photos stay upright after metadata is dropped.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return original; // e.g. HEIC outside Safari
  }
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, preset.maxDimension);
    const canvas: HTMLCanvasElement | OffscreenCanvas = typeof OffscreenCanvas === "function"
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement("canvas"), { width, height });
    const context = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    if (!context) return original;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    // Browsers that cannot encode WebP silently return PNG, so check the type we actually got.
    let blob = await encode(canvas, "image/webp", preset.quality);
    if (blob?.type !== "image/webp") {
      blob = hasTransparency(bitmap) ? null : await encode(canvas, "image/jpeg", preset.quality);
      if (blob && blob.type !== "image/jpeg") blob = null;
    }
    if (!blob || !isWorthwhile(file.size, blob.size)) return original;
    return { blob, type: blob.type, name: renameForType(name, blob.type), originalSize: file.size, changed: true };
  } finally {
    bitmap.close();
  }
}

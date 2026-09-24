/** Browser QR decoding with jsQR (loaded on first use). Shared by the QR Code Reader and /share/qr-code-to-url. */

export type JsQr = typeof import("jsqr").default;
let decoderPromise: Promise<JsQr> | null = null;
// Loaded on first use so pages that never decode don't download it.
export const loadDecoder = () => (decoderPromise ??= import("jsqr").then((module) => module.default));

/** Draws the source with a white quiet zone at a given longest side and tries to decode it. */
export function decodeFrom(jsQR: JsQr, source: CanvasImageSource, width: number, height: number, longest: number) {
  const scale = Math.min(1, longest / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale)), h = Math.max(1, Math.round(height * scale));
  const pad = Math.round(Math.max(w, h) * 0.08);
  const canvas = document.createElement("canvas");
  canvas.width = w + pad * 2;
  canvas.height = h + pad * 2;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, pad, pad, w, h);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  // Empty results are false positives (jsQR occasionally "finds" a code with no data in busy images).
  return jsQR(data, canvas.width, canvas.height, { inversionAttempts: "attemptBoth" })?.data || null;
}

export async function decodeImage(file: Blob) {
  const jsQR = await loadDecoder();
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This image couldn't be opened. Try a PNG, JPG, or WebP file, or a screenshot.");
  }
  try {
    // Large photos decode better downscaled; small codes decode better at full size. Try a few sizes.
    for (const longest of [1400, 900, 600, 2400]) {
      const result = decodeFrom(jsQR, bitmap, bitmap.width, bitmap.height, longest);
      if (result !== null) return result;
    }
    return null;
  } finally {
    bitmap.close();
  }
}

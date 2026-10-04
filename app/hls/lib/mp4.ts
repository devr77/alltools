/**
 * Rewraps HLS media (MPEG-TS, or fragmented MP4) as a standard MP4: one moov with complete sample tables, then the
 * media, with nothing re-encoded. QuickTime, Safari, iPhone, Windows, and video editors need this layout; they don't
 * reliably read fragmented MP4. Uses mediabunny (MPL-2.0), loaded on demand.
 *
 * The input is a list of timelines: runs of segments between discontinuities, each a Blob of the original bytes
 * (an fMP4 timeline starts with its init section). Each timeline is shifted to start where the previous one ended.
 */
type Bytes = Uint8Array<ArrayBuffer>;
type Packet = import("mediabunny").EncodedPacket;

/** Collects positioned writes (appends, plus the odd header patch) as Blob parts, so the file never sits in memory. */
export class BlobWriter {
  private parts: { start: number; blob: Blob }[] = [];
  private end = 0;

  write(position: number, data: Bytes) {
    const blob = new Blob([data]);
    const stop = position + data.byteLength;
    if (position >= this.end) {
      if (position > this.end) this.parts.push({ start: this.end, blob: new Blob([new Uint8Array(position - this.end)]) });
      this.parts.push({ start: position, blob });
      this.end = stop;
      return;
    }
    // An overwrite of bytes already written (e.g. the mdat size): cut the parts it covers around the new data.
    const kept: { start: number; blob: Blob }[] = [];
    for (const part of this.parts) {
      const partEnd = part.start + part.blob.size;
      if (partEnd <= position || part.start >= stop) { kept.push(part); continue; }
      if (part.start < position) kept.push({ start: part.start, blob: part.blob.slice(0, position - part.start) });
      if (partEnd > stop) kept.push({ start: stop, blob: part.blob.slice(stop - part.start) });
    }
    kept.push({ start: position, blob });
    this.parts = kept.sort((a, b) => a.start - b.start);
    this.end = Math.max(this.end, stop);
  }

  finish(type: string) {
    return new Blob(this.parts.map((part) => part.blob), { type });
  }
}

/** MPEG-TS video stream types the MP4 can't hold (H.264 is 0x1b and H.265 0x24; those are fine). */
const TS_UNSUPPORTED_VIDEO: Record<number, string> = {
  0x01: "MPEG-1 video", 0x02: "MPEG-2 video", 0x10: "MPEG-4 Part 2 video", 0x42: "AVS video", 0xea: "VC-1 video",
};

/** Stream types listed in the program maps (PMT) of an MPEG-TS sample, e.g. 0x1b for H.264. Assumes 188-byte packets. */
export function tsStreamTypes(bytes: Uint8Array): number[] {
  const programMaps = new Set<number>();
  const types = new Set<number>();
  for (let packet = 0; packet + 188 <= bytes.length; packet += 188) {
    if (bytes[packet] !== 0x47 || !(bytes[packet + 1] & 0x40)) continue;
    const pid = ((bytes[packet + 1] & 0x1f) << 8) | bytes[packet + 2];
    const adaptation = (bytes[packet + 3] >> 4) & 3;
    if (adaptation === 2) continue;
    let at = packet + 4 + (adaptation === 3 ? 1 + bytes[packet + 4] : 0);
    at += 1 + bytes[at]; // pointer field
    const end = Math.min(at + 3 + (((bytes[at + 1] & 0x0f) << 8) | bytes[at + 2]) - 4, packet + 188);
    if (pid === 0 && bytes[at] === 0x00) {
      for (let entry = at + 8; entry + 4 <= end; entry += 4) {
        if ((bytes[entry] << 8 | bytes[entry + 1]) !== 0) programMaps.add(((bytes[entry + 2] & 0x1f) << 8) | bytes[entry + 3]);
      }
    } else if (programMaps.has(pid) && bytes[at] === 0x02) {
      for (let entry = at + 12 + (((bytes[at + 10] & 0x0f) << 8) | bytes[at + 11]); entry + 5 <= end; entry += 5 + (((bytes[entry + 3] & 0x0f) << 8) | bytes[entry + 4])) {
        types.add(bytes[entry]);
      }
    }
  }
  return [...types];
}

export type RemuxOptions = { container: "ts" | "fmp4"; onProgress?: (fraction: number) => void; signal?: AbortSignal };

/** Codecs found in the media that a standard MP4 can't hold, in plain words; empty when everything fits. */
export async function unsupportedCodecs(sample: Blob, container: RemuxOptions["container"]): Promise<string[]> {
  const mb = await import("mediabunny");
  const input = new mb.Input({ source: new mb.BlobSource(sample), formats: container === "ts" ? [mb.MPEG_TS] : [mb.MP4] });
  try {
    const supported = new mb.Mp4OutputFormat().getSupportedCodecs();
    // mediabunny skips TS streams it can't read (MPEG-2 video, for one), which would silently leave the video out.
    const skipped = container === "ts"
      ? tsStreamTypes(new Uint8Array(await sample.slice(0, 256 * 1024).arrayBuffer())).map((type) => TS_UNSUPPORTED_VIDEO[type]).filter(Boolean)
      : [];
    const tracks = [await input.getPrimaryVideoTrack(), await input.getPrimaryAudioTrack()].filter(Boolean);
    if (!tracks.length && !skipped.length) return ["no audio or video the converter recognizes"];
    return [...skipped, ...tracks.filter((track) => !track.codec || !supported.includes(track.codec)).map((track) => track.codec ?? `an unknown ${track.type} codec`)];
  } finally {
    input.dispose();
  }
}

export async function remuxToMp4(timelines: Blob[], { container, onProgress, signal }: RemuxOptions): Promise<Blob> {
  const mb = await import("mediabunny");
  const writer = new BlobWriter();
  const output = new mb.Output({
    format: new mb.Mp4OutputFormat({ fastStart: false }),
    target: new mb.StreamTarget(new WritableStream({ write: (chunk) => writer.write(chunk.position, chunk.data) }), { chunked: true, chunkSize: 4 * 1024 * 1024 }),
  });
  const total = timelines.reduce((sum, blob) => sum + blob.size, 0) || 1;
  let before = 0;
  let reported = -1;
  let end = 0;
  let video: InstanceType<typeof mb.EncodedVideoPacketSource> | null = null;
  let audio: InstanceType<typeof mb.EncodedAudioPacketSource> | null = null;
  const sent = { video: 0, audio: 0 };

  try {
    for (const [index, blob] of timelines.entries()) {
      const input = new mb.Input({ source: new mb.BlobSource(blob), formats: container === "ts" ? [mb.MPEG_TS] : [mb.MP4] });
      try {
        const videoTrack = await input.getPrimaryVideoTrack();
        const audioTrack = await input.getPrimaryAudioTrack();
        if (index === 0) {
          if (!videoTrack && !audioTrack) throw new Error("No audio or video was found in the downloaded data.");
          if (videoTrack) output.addVideoTrack(video = new mb.EncodedVideoPacketSource(videoTrack.codec));
          if (audioTrack) output.addAudioTrack(audio = new mb.EncodedAudioPacketSource(audioTrack.codec));
          await output.start();
        }
        // One lane per track. The decoder config goes with the first packet of the whole file, as the muxer expects.
        const videoConfig = videoTrack && video ? await videoTrack.getDecoderConfig() : null;
        const audioConfig = audioTrack && audio ? await audioTrack.getDecoderConfig() : null;
        const lanes = [
          videoConfig && { track: videoTrack, add: (packet: Packet) => video.add(packet, index === 0 && !sent.video++ ? { decoderConfig: videoConfig } : undefined) },
          audioConfig && { track: audioTrack, add: (packet: Packet) => audio.add(packet, index === 0 && !sent.audio++ ? { decoderConfig: audioConfig } : undefined) },
        ].filter(Boolean).map((lane) => ({ ...lane, packets: new mb.EncodedPacketSink(lane.track).packets(), next: null as Packet | null }));
        if (!lanes.length) continue;
        const first = await input.getFirstTimestamp(lanes.map((lane) => lane.track));
        const duration = Math.max(await input.computeDuration(lanes.map((lane) => lane.track)) - first, 0.001);
        const shift = end - first;
        for (const lane of lanes) lane.next = (await lane.packets.next()).value || null;

        // Interleave the tracks by timestamp, so the muxer writes audio and video side by side.
        for (;;) {
          signal?.throwIfAborted();
          const lane = lanes.filter((entry) => entry.next).reduce((a, b) => (!a || b.next.timestamp < a.next.timestamp ? b : a), null);
          if (!lane) break;
          const packet = lane.next.clone({ timestamp: lane.next.timestamp + shift });
          await lane.add(packet);
          end = Math.max(end, packet.timestamp + packet.duration);
          const fraction = (before + blob.size * Math.min(1, Math.max(0, (lane.next.timestamp - first) / duration))) / total;
          if (onProgress && fraction - reported >= 0.005) onProgress(reported = fraction);
          lane.next = (await lane.packets.next()).value || null;
        }
      } finally {
        input.dispose();
        before += blob.size;
      }
    }
    await output.finalize();
  } catch (cause) {
    if (output.state === "started" || output.state === "pending") await output.cancel().catch(() => undefined);
    throw cause;
  }
  onProgress?.(1);
  return writer.finish("video/mp4");
}

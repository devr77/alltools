// The part of mux.js (Apache-2.0, no bundled types) that app/hls/lib/remux.ts uses.
declare module "mux.js" {
  type TransmuxedSegment = { initSegment: Uint8Array<ArrayBuffer>; data: Uint8Array<ArrayBuffer> };
  interface Transmuxer {
    on(event: "data", listener: (segment: TransmuxedSegment) => void): void;
    /** Each flushed fragment's span on the output timeline, in 90 kHz units (audio is converted to the video clock). */
    on(event: "videoSegmentTimingInfo" | "audioSegmentTimingInfo", listener: (info: { start: { dts: number }; end: { dts: number } }) => void): void;
    push(bytes: Uint8Array): void;
    flush(): void;
  }
  type Options = {
    remux?: boolean; keepOriginalTimestamps?: boolean;
    /** Where output timestamps start (90 kHz clock). Applied when a track is first seen, not to tracks already running. */
    baseMediaDecodeTime?: number;
  };
  const muxjs: { mp4: { Transmuxer: new (options?: Options) => Transmuxer } };
  export default muxjs;
}

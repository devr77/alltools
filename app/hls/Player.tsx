"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
import type { ErrorData } from "hls.js";
import { usePostHog } from "posthog-js/react";
import Icon from "./Icon";
import UrlForm, { useStreamParam, withStream } from "./UrlForm";
import type { ToolLinks } from "./place";
import { checkStreamUrl } from "./lib/download";
import { formatBitrate } from "./lib/format";

type Level = { index: number; label: string; bitrate: number };
type Now = { resolution: string; bitrate: number };

/** A fatal hls.js error in words: what failed and what the visitor can do. */
function explain(data: ErrorData): string {
  const code = data.response?.code ?? 0;
  const what = /^manifest/i.test(data.details) ? "playlist" : /^level/i.test(data.details) ? "quality playlist" : /^key/i.test(data.details) ? "decryption key" : "video segments";
  if (data.type === "keySystemError") return "This stream is DRM-protected, so it can't be played here.";
  if (data.details === "manifestParsingError") return "That address didn't return an M3U8 playlist. Paste the playlist URL itself (it usually ends in .m3u8).";
  if (data.details === "manifestIncompatibleCodecsError") return "This browser can't decode any of the stream's codecs. H.265 and Dolby audio, for example, play only in some browsers.";
  if (data.type === "networkError") {
    if (code === 401 || code === 403) return `The server refused access to the ${what} (HTTP ${code}). The link may have expired or only work on its own site.`;
    if (code === 404 || code === 410) return `The ${what} wasn't found (HTTP ${code}). The link may have expired.`;
    if (code >= 400) return `The server returned HTTP ${code} for the ${what}.`;
    if (/timeout/i.test(data.details)) return `Loading the ${what} timed out. The server may be slow or unreachable.`;
    return `Couldn't load the ${what}. The server doesn't allow other websites to read it (CORS), the address is wrong, or you're offline.`;
  }
  if (data.type === "mediaError") return "The browser couldn't decode this stream. It may use a codec this browser doesn't support.";
  return `Playback failed (${data.details}).`;
}

export default function Player({ links }: { links: ToolLinks }) {
  const posthog = usePostHog();
  const video = useRef<HTMLVideoElement>(null);
  const engine = useRef<Hls | null>(null);
  const [input, setInput] = useState("");
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [levels, setLevels] = useState<Level[]>([]);
  const [level, setLevel] = useState(-1);
  const [now, setNow] = useState<Now | null>(null);
  const [live, setLive] = useState(false);

  const stop = useCallback(() => {
    engine.current?.destroy();
    engine.current = null;
    const element = video.current;
    if (element) {
      element.removeAttribute("src");
      element.load();
    }
  }, []);

  const play = useCallback(async (value: string) => {
    setError("");
    setLevels([]);
    setLevel(-1);
    setNow(null);
    setLive(false);
    let url: string;
    try { url = checkStreamUrl(value); } catch (cause) { setError(cause.message); return; }
    stop();
    setSource(url);
    setBusy(true);
    const element = video.current;
    try {
      const { default: HlsClass } = await import("hls.js");
      if (HlsClass.isSupported()) {
        const hls = new HlsClass({ enableWorker: true });
        engine.current = hls;
        let recovered = false;
        hls.on(HlsClass.Events.MANIFEST_PARSED, () => {
          setBusy(false);
          setLevels(hls.levels.map((entry, index) => ({
            index, bitrate: entry.bitrate, label: entry.height ? `${entry.height}p` : formatBitrate(entry.bitrate),
          })).sort((a, b) => b.bitrate - a.bitrate));
          element.play().catch(() => { /* autoplay refused; the controls still work */ });
          posthog?.capture("hls_play_started", { engine: "hls.js" });
        });
        hls.on(HlsClass.Events.LEVEL_SWITCHED, (_event, data) => {
          const entry = hls.levels[data.level];
          if (entry) setNow({ resolution: entry.width && entry.height ? `${entry.width}×${entry.height}` : "Audio only", bitrate: entry.bitrate });
        });
        hls.on(HlsClass.Events.LEVEL_LOADED, (_event, data) => setLive(data.details.live));
        hls.on(HlsClass.Events.ERROR, (_event, data) => {
          if (!data.fatal) return;
          // One media-error recovery attempt, as hls.js recommends; anything else stops playback with an explanation.
          if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR && !recovered) {
            recovered = true;
            hls.recoverMediaError();
            return;
          }
          setBusy(false);
          setError(explain(data));
          posthog?.capture("hls_play_failed", { type: data.type, details: data.details });
          hls.destroy();
          if (engine.current === hls) engine.current = null;
        });
        hls.loadSource(url);
        hls.attachMedia(element);
      } else if (element.canPlayType("application/vnd.apple.mpegurl")) {
        // iPhone Safari has no Media Source Extensions but plays HLS itself.
        element.src = url;
        element.addEventListener("loadedmetadata", () => setBusy(false), { once: true });
        element.addEventListener("error", () => { setBusy(false); setError("The stream couldn't be played. The link may have expired, be blocked, or be DRM-protected."); }, { once: true });
        element.play().catch(() => { /* the controls still work */ });
        posthog?.capture("hls_play_started", { engine: "native" });
      } else {
        setBusy(false);
        setError("This browser can't play HLS streams. Try a current version of Chrome, Edge, Firefox, or Safari.");
      }
    } catch (cause) {
      setBusy(false);
      setError(cause instanceof Error ? cause.message : "The player couldn't start.");
    }
  }, [posthog, stop]);

  useStreamParam(useCallback((url: string) => { setInput(url); play(url); }, [play]));
  useEffect(() => stop, [stop]);

  const pick = (index: number) => {
    setLevel(index);
    if (engine.current) engine.current.currentLevel = index;
  };

  return (
    <div className="tool" id="player">
      <UrlForm id="player-url" value={input} onChange={setInput} onSubmit={play} busy={busy} action="Play" busyLabel="Loading…" />
      {error && <p className="alert" role="alert">{error}</p>}
      <div className="screen">
        <video ref={video} controls playsInline preload="none" aria-label="Stream player" />
        {!source && <p className="screen-empty"><Icon name="play" size={28} /><span>Paste an .m3u8 link above to start playing</span></p>}
      </div>
      {source && !error && (
        <div className="player-bar">
          {levels.length > 1 && (
            <label className="field inline">
              <span>Quality</span>
              <select value={level} onChange={(event) => pick(Number(event.target.value))}>
                <option value={-1}>Auto</option>
                {levels.map((entry) => <option key={entry.index} value={entry.index}>{entry.label} · {formatBitrate(entry.bitrate)}</option>)}
              </select>
            </label>
          )}
          {now && <p className="muted">Playing <b>{now.resolution}</b> at {formatBitrate(now.bitrate)}{live && <> · <span className="live">Live</span></>}</p>}
          <div className="actions">
            <a className="button button-ghost" href={withStream(links.download, source)}><Icon name="download" size={16} /> Download</a>
            <a className="button button-ghost" href={withStream(links.checker, source)}><Icon name="list" size={16} /> Inspect</a>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePostHog } from "posthog-js/react";
import Icon from "./Icon";
import UrlForm, { useStreamParam, withStream } from "./UrlForm";
import type { ToolLinks } from "./place";
import { describeCodecs, mp4Compatible, rankVariants, separateAudio, type MasterPlaylist, type MediaPlaylist } from "./lib/m3u8";
import { downloadStream, loadPlaylist, type DownloadProgress } from "./lib/download";
import type { Format } from "./lib/remux";
import { fileBase, formatBitrate, formatBytes, formatDuration } from "./lib/format";

type Option = { uri: string; label: string; detail: string; codecs?: string; separateAudio?: boolean; audioOnly?: boolean };
type Shown = DownloadProgress & { elapsed: number };
type Result = { url: string; name: string; size: number; extension: string; warnings: string[] };

/** The qualities a master playlist offers, best first, followed by audio tracks that have their own playlist. */
function optionsFor(master: MasterPlaylist): Option[] {
  const variants = rankVariants(master.variants).map((variant) => ({
    uri: variant.uri,
    label: variant.resolution ? `${variant.resolution.height}p` : variant.codecs && !/avc|hvc|hev|av01|vp0?9/i.test(variant.codecs) ? "Audio" : formatBitrate(variant.bandwidth),
    detail: [
      variant.resolution && `${variant.resolution.width}×${variant.resolution.height}`, formatBitrate(variant.averageBandwidth || variant.bandwidth),
      describeCodecs(variant.codecs), variant.frameRate && `${Math.round(variant.frameRate)} fps`,
    ].filter(Boolean).join(" · "),
    codecs: variant.codecs,
    separateAudio: separateAudio(master, variant).length > 0,
  }));
  const seen = new Set<string>();
  const audio = master.renditions.filter((rendition) => rendition.type === "AUDIO" && rendition.uri && !seen.has(rendition.uri) && seen.add(rendition.uri))
    .map((rendition) => ({
      uri: rendition.uri, label: `Audio: ${rendition.name}`, audioOnly: true,
      detail: [rendition.language, rendition.channels && `${rendition.channels.split("/")[0]} channels`].filter(Boolean).join(" · ") || "Separate audio track",
    }));
  return [...variants, ...audio];
}

const bucket = (size: number) => (size < 1e7 ? "<10MB" : size < 1e8 ? "10-100MB" : size < 1e9 ? "100MB-1GB" : ">1GB");

export default function Downloader({ links }: { links: ToolLinks }) {
  const posthog = usePostHog();
  const [input, setInput] = useState("");
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [master, setMaster] = useState<MasterPlaylist | null>(null);
  const [choice, setChoice] = useState("");
  const [media, setMedia] = useState<MediaPlaylist | null>(null);
  const [format, setFormat] = useState<Format>("mp4");
  const [name, setName] = useState("");
  const [progress, setProgress] = useState<Shown | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const job = useRef<AbortController | null>(null);
  const request = useRef(0);

  const options = master ? optionsFor(master) : [];
  const option = options.find((entry) => entry.uri === choice);
  const fmp4 = media?.segments.some((segment) => segment.map);
  const packedAudio = media && /\.(aac|mp3)(?:[?#]|$)/i.test(media.segments[0]?.uri ?? "");
  const canMp4 = mp4Compatible(option?.codecs);
  const effectiveFormat: Format = canMp4 ? format : "original";
  const encrypted = media?.segments.some((segment) => segment.key);
  const downloading = progress !== null && !result;

  const clearResult = useCallback(() => {
    setResult((previous) => { if (previous) URL.revokeObjectURL(previous.url); return null; });
  }, []);

  // Loads one media playlist (a chosen quality). Stale responses from an earlier choice are ignored.
  const loadMedia = useCallback(async (uri: string) => {
    const id = ++request.current;
    setBusy(true);
    setError("");
    setMedia(null);
    try {
      const { playlist } = await loadPlaylist(uri);
      if (id !== request.current) return;
      if (playlist.kind !== "media") throw new Error("This quality points to another master playlist, which isn't supported.");
      setMedia(playlist);
    } catch (cause) {
      if (id === request.current) setError(cause instanceof Error ? cause.message : "Couldn't load that quality.");
    } finally {
      if (id === request.current) setBusy(false);
    }
  }, []);

  const load = useCallback(async (value: string) => {
    job.current?.abort();
    const id = ++request.current;
    clearResult();
    setProgress(null);
    setMaster(null);
    setMedia(null);
    setChoice("");
    setError("");
    setBusy(true);
    try {
      const { playlist } = await loadPlaylist(value);
      if (id !== request.current) return;
      setSource(playlist.url);
      if (playlist.kind === "master") {
        const first = optionsFor(playlist)[0];
        if (!first) throw new Error("This master playlist lists no playable qualities.");
        setMaster(playlist);
        setChoice(first.uri);
        await loadMedia(first.uri);
      } else {
        setMedia(playlist);
        setBusy(false);
      }
    } catch (cause) {
      if (id !== request.current) return;
      setError(cause instanceof Error ? cause.message : "Couldn't load that playlist.");
      setBusy(false);
    }
  }, [clearResult, loadMedia]);

  useStreamParam(useCallback((url: string) => { setInput(url); load(url); }, [load]));

  // Leaving mid-download loses the work, so ask first; also free the finished file when the panel goes away.
  useEffect(() => {
    if (!downloading) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [downloading]);
  useEffect(() => () => { job.current?.abort(); }, []);

  const choose = (uri: string) => {
    setChoice(uri);
    loadMedia(uri);
  };

  const start = async () => {
    if (!media) return;
    const controller = new AbortController();
    job.current = controller;
    clearResult();
    setError("");
    const begin = performance.now();
    setProgress({ done: 0, total: media.segments.length, bytes: 0, seconds: 0, elapsed: 0 });
    try {
      const output = await downloadStream(media, {
        format: effectiveFormat, signal: controller.signal,
        onProgress: (update) => setProgress({ ...update, elapsed: (performance.now() - begin) / 1000 }),
      });
      const file = `${fileBase(name, source)}${option?.audioOnly ? "-audio" : ""}.${output.extension}`;
      const url = URL.createObjectURL(output.blob);
      setResult({ url, name: file, size: output.blob.size, extension: output.extension, warnings: output.warnings });
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file;
      anchor.click();
      posthog?.capture("hls_download_completed", { extension: output.extension, size_bucket: bucket(output.blob.size), segments: media.segments.length, encrypted: !!encrypted });
    } catch (cause) {
      setProgress(null);
      if (controller.signal.aborted && controller.signal.reason === "cancel") setError("Download cancelled.");
      else {
        setError(cause instanceof Error ? cause.message : "The download failed.");
        posthog?.capture("hls_download_failed", { format: effectiveFormat });
      }
    } finally {
      if (job.current === controller) job.current = null;
    }
  };

  const reset = () => {
    clearResult();
    setProgress(null);
  };

  const percent = progress?.total ? Math.floor((progress.done / progress.total) * 100) : 0;
  const speed = progress?.bytes && progress.elapsed > 1 ? progress.bytes / progress.elapsed : 0;
  const eta = progress?.done ? (progress.elapsed / progress.done) * (progress.total - progress.done) : 0;

  return (
    <div className="tool" id="downloader">
      <UrlForm id="hls-url" value={input} onChange={setInput} onSubmit={load} busy={busy} disabled={downloading} action="Load" busyLabel="Loading…" />

      {error && <p className="alert" role="alert">{error}</p>}

      {master && (
        <fieldset className="choices" disabled={downloading}>
          <legend>Quality</legend>
          <div className="choice-grid">
            {options.map((entry) => (
              <label key={entry.uri} className="choice">
                <input type="radio" name="quality" value={entry.uri} checked={choice === entry.uri} onChange={() => choose(entry.uri)} />
                <span><strong>{entry.label}</strong><small>{entry.detail}</small></span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {option?.separateAudio && (
        <p className="note"><Icon name="alert" size={16} /> This quality&apos;s sound is a separate track. Download the video, then choose the audio track above and download it too; a video editor or ffmpeg can combine them.</p>
      )}

      {busy && master && !media && <p className="muted">Loading this quality…</p>}

      {media && (
        <>
          <ul className="summary">
            <li><b>{formatDuration(media.duration)}</b> duration</li>
            <li><b>{media.segments.length}</b> segments</li>
            <li><b>{fmp4 ? "fMP4" : packedAudio ? "Audio" : "TS"}</b> container</li>
            <li><b>{media.endList ? "On demand" : "Live"}</b> {media.endList ? "stream" : "window"}</li>
            {encrypted && <li><b>AES-128</b> encrypted</li>}
          </ul>
          {media.warnings.map((warning) => <p key={warning} className="note"><Icon name="alert" size={16} /> {warning}</p>)}

          <div className="settings">
            <label className="field">
              <span>File name</span>
              <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder={fileBase("", source)} disabled={downloading} />
            </label>
            {!fmp4 && !packedAudio && (
              <fieldset className="segmented" disabled={downloading}>
                <legend>Save as</legend>
                <label><input type="radio" name="format" checked={effectiveFormat === "mp4"} disabled={!canMp4} onChange={() => setFormat("mp4")} /><span>MP4</span></label>
                <label><input type="radio" name="format" checked={effectiveFormat === "original"} onChange={() => setFormat("original")} /><span>TS (original)</span></label>
              </fieldset>
            )}
          </div>
          {!canMp4 && !fmp4 && <p className="note"><Icon name="alert" size={16} /> This quality uses {describeCodecs(option?.codecs)}, which the in-browser MP4 converter can&apos;t rewrap, so it saves as TS. VLC plays it; ffmpeg can convert it.</p>}

          {!downloading && !result && (
            <div className="actions">
              <button type="button" className="button" onClick={start} disabled={busy}><Icon name="download" size={18} /> Download</button>
              {/* Full page loads, so the next tool reads ?url= from the address on mount. */}
              <a className="button button-ghost" href={withStream(links.player, source)}><Icon name="play" size={16} /> Preview</a>
              <a className="button button-ghost" href={withStream(links.checker, source)}><Icon name="list" size={16} /> Inspect</a>
            </div>
          )}
        </>
      )}

      {downloading && (
        <div className="progress">
          <div className="bar" role="progressbar" aria-label="Download progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{ width: `${percent}%` }} /></div>
          <div className="progress-row">
            <p>
              <b>{percent}%</b> · {progress.done} of {progress.total} segments · {formatBytes(progress.bytes)}
              {speed > 0 && <> · {formatBytes(speed)}/s</>}
              {progress.done > 0 && progress.done < progress.total && <> · about {formatDuration(eta)} left</>}
            </p>
            <button type="button" className="button button-ghost" onClick={() => job.current?.abort("cancel")}><Icon name="x" size={16} /> Cancel</button>
          </div>
          <p className="muted">Keep this tab open until the download finishes.</p>
        </div>
      )}

      {result && (
        <div className="result" role="status">
          <div className="result-head">
            <span className="result-icon"><Icon name="check" size={20} /></span>
            <div><strong>{result.name}</strong><small>{formatBytes(result.size)} · {formatDuration(media?.duration ?? 0)} · saved to your downloads</small></div>
          </div>
          {result.warnings.map((warning) => <p key={warning} className="note"><Icon name="alert" size={16} /> {warning}</p>)}
          {result.extension === "mp4" && <video className="preview" src={result.url} controls preload="metadata" />}
          <div className="actions">
            <a className="button" href={result.url} download={result.name}><Icon name="download" size={18} /> Save again</a>
            <button type="button" className="button button-ghost" onClick={reset}>Download another quality</button>
          </div>
        </div>
      )}
    </div>
  );
}

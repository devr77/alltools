"use client";

import { useCallback, useState } from "react";
import { usePostHog } from "posthog-js/react";
import Icon from "./Icon";
import UrlForm, { useStreamParam, withStream } from "./UrlForm";
import type { ToolLinks } from "./place";
import { describeCodecs, rankVariants, type MediaPlaylist, type Playlist } from "./lib/m3u8";
import { loadPlaylist } from "./lib/download";
import { formatBitrate, formatDuration } from "./lib/format";

type Report = { text: string; playlist: Playlist };
/** A variant's media playlist, loaded on request ("Check all variants"). */
type Probe = { state: "loading" } | { state: "ok"; media: MediaPlaylist } | { state: "error"; message: string };

const container = (media: MediaPlaylist) => {
  if (media.segments.some((segment) => segment.map)) return "fMP4";
  const extension = /\.([a-z0-9]{2,4})(?:[?#]|$)/i.exec(media.segments[0]?.uri ?? "")?.[1]?.toLowerCase();
  return extension === "ts" ? "TS" : extension === "aac" ? "AAC" : extension === "mp3" ? "MP3" : extension === "vtt" || extension === "webvtt" ? "WebVTT" : extension ? `.${extension}` : "–";
};

const encryption = (media: MediaPlaylist) => [...new Set(media.segments.map((segment) => segment.key?.method).filter(Boolean))].join(", ") || "None";

function MediaFacts({ media }: { media: MediaPlaylist }) {
  const durations = media.segments.map((segment) => segment.duration);
  const average = durations.length ? media.duration / durations.length : 0;
  const rows: [string, string][] = [
    ["Type", media.endList ? `On demand${media.playlistType ? ` (${media.playlistType})` : ""}` : `Live${media.playlistType === "EVENT" ? " event" : ""}, still being updated`],
    ["Duration", `${formatDuration(media.duration)} (${media.duration.toFixed(2)} s)`],
    ["Segments", `${media.segments.length}, average ${average.toFixed(2)} s, longest ${Math.max(0, ...durations).toFixed(2)} s`],
    ["Target duration", media.targetDuration ? `${media.targetDuration} s` : "Missing"],
    ["Container", container(media)],
    ["Encryption", encryption(media)],
    ["Media sequence", String(media.mediaSequence)],
    ["Discontinuities", String(media.discontinuities)],
    ["Byte ranges", media.segments.some((segment) => segment.byteRange) ? "Yes" : "No"],
    ["HLS version", String(media.version)],
  ];
  return (
    <dl className="facts-grid">
      {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
  );
}

export default function Checker({ links }: { links: ToolLinks }) {
  const posthog = usePostHog();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [probes, setProbes] = useState<Record<string, Probe>>({});

  const check = useCallback(async (value: string) => {
    setBusy(true);
    setError("");
    setReport(null);
    setProbes({});
    try {
      const loaded = await loadPlaylist(value);
      setReport(loaded);
      posthog?.capture("hls_check_completed", { kind: loaded.playlist.kind });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't load that playlist.");
      posthog?.capture("hls_check_failed");
    } finally {
      setBusy(false);
    }
  }, [posthog]);

  useStreamParam(useCallback((url: string) => { setInput(url); check(url); }, [check]));

  const probe = async (uris: string[]) => {
    setProbes((current) => ({ ...current, ...Object.fromEntries(uris.map((uri) => [uri, { state: "loading" } as Probe])) }));
    // A few at a time, so a long variant list doesn't hit the server all at once.
    const queue = [...uris];
    await Promise.all(Array.from({ length: Math.min(4, queue.length) }, async () => {
      for (let uri = queue.shift(); uri; uri = queue.shift()) {
        let result: Probe;
        try {
          const { playlist } = await loadPlaylist(uri);
          result = playlist.kind === "media" ? { state: "ok", media: playlist } : { state: "error", message: "Points to another master playlist" };
        } catch (cause) {
          result = { state: "error", message: cause instanceof Error ? cause.message : "Failed to load" };
        }
        setProbes((current) => ({ ...current, [uri]: result }));
      }
    }));
  };

  const playlist = report?.playlist;
  const variants = playlist?.kind === "master" ? rankVariants(playlist.variants) : [];
  const trickPlay = playlist?.kind === "master" ? playlist.variants.filter((variant) => variant.iframeOnly).length : 0;
  const detailed = Object.entries(probes).filter((entry): entry is [string, Extract<Probe, { state: "ok" }>] => entry[1].state === "ok");
  const lengths = new Set(detailed.map(([, entry]) => Math.round(entry.media.duration)));

  return (
    <div className="tool" id="checker">
      <UrlForm id="checker-url" value={input} onChange={setInput} onSubmit={check} busy={busy} action="Check" busyLabel="Checking…" />
      {error && <p className="alert" role="alert">{error}</p>}

      {playlist && (
        <div className="report" role="status">
          <div className="report-head">
            <span className="badge ok"><Icon name="check" size={14} /> Playlist loads</span>
            <span className="badge">{playlist.kind === "master" ? "Master playlist" : "Media playlist"}</span>
            <code className="report-url">{playlist.url}</code>
          </div>

          {playlist.warnings.length > 0 && (
            <ul className="warnings">
              {playlist.warnings.map((warning) => <li key={warning}><Icon name="alert" size={16} /> {warning}</li>)}
            </ul>
          )}

          {playlist.kind === "master" && (
            <>
              <div className="table-head">
                <h3>{variants.length} {variants.length === 1 ? "variant" : "variants"}{trickPlay ? ` + ${trickPlay} trick-play` : ""}</h3>
                <button type="button" className="button button-ghost" onClick={() => probe(variants.map((variant) => variant.uri))}>Check all variants</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Resolution</th><th>Bitrate</th><th>Codecs</th><th>Frame rate</th><th>Audio</th><th>Media playlist</th></tr></thead>
                  <tbody>
                    {variants.map((variant) => {
                      const state = probes[variant.uri];
                      return (
                        <tr key={variant.uri}>
                          <td>{variant.resolution ? `${variant.resolution.width}×${variant.resolution.height}` : "–"}</td>
                          <td>{formatBitrate(variant.bandwidth)}{variant.averageBandwidth ? <small> avg {formatBitrate(variant.averageBandwidth)}</small> : null}</td>
                          <td title={variant.codecs}>{describeCodecs(variant.codecs) || "Not declared"}</td>
                          <td>{variant.frameRate ? `${variant.frameRate} fps` : "–"}</td>
                          <td>{variant.audio || "Muxed"}</td>
                          <td>
                            {!state && <button type="button" className="link-button" onClick={() => probe([variant.uri])}>Check</button>}
                            {state?.state === "loading" && <span className="muted">Loading…</span>}
                            {state?.state === "ok" && <span>{formatDuration(state.media.duration)} · {state.media.segments.length} seg · {container(state.media)}{state.media.segments.some((segment) => segment.key) ? ` · ${encryption(state.media)}` : ""}</span>}
                            {state?.state === "error" && <span className="bad" title={state.message}>Failed: {state.message.split(".")[0]}</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {lengths.size > 1 && <p className="note"><Icon name="alert" size={16} /> Variants have different durations ({[...lengths].map(formatDuration).join(", ")}). Players can jump or stall when they switch quality.</p>}

              {playlist.renditions.length > 0 && (
                <>
                  <h3 className="table-title">{playlist.renditions.length} alternative {playlist.renditions.length === 1 ? "track" : "tracks"}</h3>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Type</th><th>Name</th><th>Language</th><th>Group</th><th>Default</th><th>Own playlist</th></tr></thead>
                      <tbody>
                        {playlist.renditions.map((rendition) => (
                          <tr key={`${rendition.type}-${rendition.groupId}-${rendition.name}-${rendition.uri}`}>
                            <td>{rendition.type.toLowerCase().replace("-", " ")}</td><td>{rendition.name}</td><td>{rendition.language || "–"}</td>
                            <td>{rendition.groupId}</td><td>{rendition.isDefault ? "Yes" : "No"}</td><td>{rendition.uri ? "Yes" : "No (muxed)"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          {playlist.kind === "media" && <MediaFacts media={playlist} />}

          {detailed.length > 0 && detailed.flatMap(([, entry]) => entry.media.warnings).length > 0 && (
            <ul className="warnings">
              {[...new Set(detailed.flatMap(([, entry]) => entry.media.warnings))].map((warning) => <li key={warning}><Icon name="alert" size={16} /> Variant: {warning}</li>)}
            </ul>
          )}

          <details className="raw">
            <summary>Raw playlist ({report.text.split(/\r?\n/).length} lines)</summary>
            <pre>{report.text}</pre>
          </details>

          <div className="actions">
            <a className="button button-ghost" href={withStream(links.player, playlist.url)}><Icon name="play" size={16} /> Play</a>
            <a className="button button-ghost" href={withStream(links.download, playlist.url)}><Icon name="download" size={16} /> Download</a>
          </div>
        </div>
      )}
    </div>
  );
}

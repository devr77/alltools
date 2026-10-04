"use client";

import { useCallback, useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import Icon from "./Icon";
import { createAssembler, sniffContainer } from "./lib/remux";
import { fileBase, formatBytes } from "./lib/format";

type Result = { url: string; name: string; size: number };

// Natural order, so segment2.ts sorts before segment10.ts.
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const isTs = (file: File) => /\.(ts|m2ts|mts|tsv|trp)$/i.test(file.name) || file.type === "video/mp2t";

/** Output name: the file's own name, or for a set of segments the shared part of their names ("clip_001.ts" -> "clip"). */
function outputName(files: File[]) {
  const base = files[0].name.replace(/\.[^.]+$/, "");
  return fileBase(files.length > 1 ? base.replace(/[\s_.-]*\d+$/, "") || "joined" : base);
}

export default function TsConverter() {
  const posthog = usePostHog();
  const [files, setFiles] = useState<File[]>([]);
  const [over, setOver] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const total = files.reduce((sum, file) => sum + file.size, 0);

  const clearResult = useCallback(() => {
    setResult((previous) => { if (previous) URL.revokeObjectURL(previous.url); return null; });
  }, []);
  useEffect(() => () => clearResult(), [clearResult]);

  const add = (list: File[]) => {
    clearResult();
    const accepted = list.filter(isTs);
    const skipped = list.length - accepted.length;
    setError(skipped ? `${skipped} ${skipped === 1 ? "file was" : "files were"} skipped: only .ts (MPEG-TS) files can be converted.` : "");
    setFiles((current) => {
      const known = new Set(current.map((file) => `${file.name}|${file.size}`));
      return [...current, ...accepted.filter((file) => !known.has(`${file.name}|${file.size}`))].sort((a, b) => collator.compare(a.name, b.name));
    });
  };

  const convert = async () => {
    clearResult();
    setError("");
    setProgress(0);
    let read = 0;
    try {
      const { default: mux } = await import("mux.js");
      const assembler = createAssembler("ts", "mp4", mux);
      for (const file of files) {
        if (sniffContainer(new Uint8Array(await file.slice(0, 376).arrayBuffer())) !== "ts") {
          throw new Error(`${file.name} isn't an MPEG-TS file, so it can't be converted. Remove it and try again.`);
        }
        // Read in chunks rather than all at once, so large files don't need one huge buffer.
        const reader = file.stream().getReader();
        for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
          assembler.push(chunk.value);
          read += chunk.value.byteLength;
          setProgress(read / total);
        }
        assembler.flush();
      }
      if (!assembler.produced()) {
        throw new Error("Nothing could be converted. The files may use codecs the in-browser converter can't read (it supports H.264 video with AAC audio), such as H.265, MPEG-2, or AC-3.");
      }
      const blob = assembler.finish();
      const name = `${outputName(files)}.mp4`;
      const url = URL.createObjectURL(blob);
      setResult({ url, name, size: blob.size });
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = name;
      anchor.click();
      posthog?.capture("hls_ts_converted", { files: files.length });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The conversion failed.");
      posthog?.capture("hls_ts_convert_failed");
    } finally {
      setProgress(null);
    }
  };

  const working = progress !== null;

  return (
    <div className="tool" id="converter">
      <input
        id="ts-files" className="visually-hidden" type="file" multiple accept=".ts,.m2ts,.mts,video/mp2t" disabled={working}
        onChange={(event) => { add([...event.target.files]); event.target.value = ""; }}
      />
      <label
        htmlFor="ts-files" className={`dropzone${over ? " is-over" : ""}`}
        onDragOver={(event) => { event.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => { event.preventDefault(); setOver(false); if (!working) add([...event.dataTransfer.files]); }}
      >
        <span className="dropzone-icon"><Icon name="upload" size={26} /></span>
        <strong>Drop .ts files here</strong>
        <span>or <u>choose files</u>. Select several segments to join them.</span>
        <small>Converted on your device. Nothing is uploaded.</small>
      </label>

      {error && <p className="alert" role="alert">{error}</p>}

      {files.length > 0 && (
        <>
          <div className="table-head">
            <h3>{files.length} {files.length === 1 ? "file" : "files"} · {formatBytes(total)}</h3>
            <button type="button" className="link-button" disabled={working} onClick={() => { setFiles([]); clearResult(); }}>Clear all</button>
          </div>
          <ol className="file-list">
            {files.map((file) => (
              <li key={`${file.name}|${file.size}`}>
                <Icon name="video" size={16} />
                <span className="file-name">{file.name}</span>
                <small>{formatBytes(file.size)}</small>
                <button
                  type="button" className="icon-only" aria-label={`Remove ${file.name}`} disabled={working}
                  onClick={() => { clearResult(); setFiles((current) => current.filter((entry) => entry !== file)); }}
                ><Icon name="x" size={14} /></button>
              </li>
            ))}
          </ol>
          {!working && (
            <div className="actions">
              <button type="button" className="button" onClick={convert}><Icon name="convert" size={18} /> Convert to MP4</button>
            </div>
          )}
        </>
      )}

      {working && (
        <div className="progress">
          <div className="bar" role="progressbar" aria-label="Conversion progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(progress * 100)}>
            <span style={{ width: `${Math.floor(progress * 100)}%` }} />
          </div>
          <p><b>{Math.floor(progress * 100)}%</b> · converting {formatBytes(total)}</p>
        </div>
      )}

      {result && (
        <div className="result" role="status">
          <div className="result-head">
            <span className="result-icon"><Icon name="check" size={20} /></span>
            <div><strong>{result.name}</strong><small>{formatBytes(result.size)} · saved to your downloads</small></div>
          </div>
          <video className="preview" src={result.url} controls preload="metadata" />
          <div className="actions">
            <a className="button" href={result.url} download={result.name}><Icon name="download" size={18} /> Save again</a>
          </div>
        </div>
      )}
    </div>
  );
}

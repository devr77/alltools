"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  createTorrent, extractMagnet, formatBytes, inspectTorrent, makeMagnet,
  MAX_CONTENT_BYTES, MAX_FILES, MAX_TORRENT_BYTES, normalizeInfoHash,
  parseTrackers, toBase32, type TorrentSummary,
} from "../lib/torrent";
import { torrentTools, type TorrentToolSlug } from "./tools";
import styles from "./Torrent.module.css";

interface ToolResult {
  infoHash: string;
  base32: string;
  magnet: string;
  summary?: TorrentSummary;
  bytes?: Uint8Array<ArrayBuffer>;
}

function saveFile(content: BlobPart, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function TorrentTool({ slug }: { slug: TorrentToolSlug }) {
  const config = torrentTools.find((tool) => tool.slug === slug)!;
  const isCreator = slug === "torrent-file-creator";
  const isMagnet = slug === "magnet-link-generator";
  const isExtractor = slug === "info-hash-extractor";
  const [source, setSource] = useState<"magnet" | "file">("magnet");
  const [hashInput, setHashInput] = useState("");
  const [magnetInput, setMagnetInput] = useState("");
  const [name, setName] = useState("");
  const [trackers, setTrackers] = useState("");
  const [comment, setComment] = useState("");
  const [privateTorrent, setPrivateTorrent] = useState(false);
  const [pieceLength, setPieceLength] = useState(256 * 1024);
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<ToolResult | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const controller = useRef<AbortController | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const showFileInput = !isMagnet && (!isExtractor || source === "file");
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  useEffect(() => () => controller.current?.abort(), []);

  function clearResult() { setResult(null); setError(""); setStatus(""); }

  function reset() {
    form.current?.reset();
    setHashInput(""); setMagnetInput(""); setName(""); setTrackers("");
    setComment(""); setPrivateTorrent(false); setPieceLength(256 * 1024);
    setFiles([]); setProgress(0); clearResult();
  }

  async function process(event: FormEvent) {
    event.preventDefault();
    clearResult();
    setBusy(true); setProgress(0);
    const current = new AbortController();
    controller.current = current;
    try {
      let output: ToolResult;
      if (isMagnet) {
        const infoHash = normalizeInfoHash(hashInput);
        output = { infoHash, base32: toBase32(infoHash), magnet: makeMagnet(infoHash, name, parseTrackers(trackers)) };
      } else if (isExtractor && source === "magnet") {
        const extracted = extractMagnet(magnetInput);
        output = { ...extracted, magnet: makeMagnet(extracted.infoHash, extracted.name, extracted.trackers) };
      } else if (isCreator) {
        const created = await createTorrent(files, {
          name, trackers: parseTrackers(trackers), comment, private: privateTorrent,
          pieceLength, onProgress: (value) => { if (!current.signal.aborted) setProgress(value); }, signal: current.signal,
        });
        output = { ...created.summary, summary: created.summary, bytes: created.bytes };
      } else {
        const file = files[0];
        if (!file) throw new Error("Choose a .torrent file first.");
        if (file.size > MAX_TORRENT_BYTES) throw new Error("Choose a .torrent file up to 10 MiB.");
        const summary = await inspectTorrent(new Uint8Array(await file.arrayBuffer()));
        output = { ...summary, summary };
      }
      if (!current.signal.aborted) { setResult(output); setStatus("Done. Your result is ready below."); }
    } catch (cause) {
      if (!current.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to process this input. Please try another file or hash.");
    } finally {
      if (!current.signal.aborted) setBusy(false);
    }
  }

  function cancel() {
    controller.current?.abort();
    setBusy(false); setProgress(0); setStatus("Torrent creation canceled. You can change your files and try again.");
  }

  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setStatus(`${label} copied.`); }
    catch { setStatus("Clipboard access is unavailable. Select the result and copy it manually."); }
  }

  const action = isCreator ? "Create torrent" : isMagnet ? "Generate magnet link" : isExtractor ? "Extract info hash" : slug === "btih-hash-generator" ? "Calculate BTIH hash" : slug === "torrent-file-to-magnet" ? "Convert to magnet link" : "Parse torrent";

  return (
    <>
      <header className={styles.header}>
        <span className={styles.eyebrow}>TORRENT &amp; HASHING</span>
        <h1><span aria-hidden="true">{config.icon}</span> {config.name}</h1>
        <p>{config.description}</p>
      </header>
      <div className={styles.workspace}>
        <div className={`${styles.panel} ph-no-capture ph-mask`}>
          <form ref={form} onSubmit={process} onChange={clearResult}>
            <fieldset disabled={busy} className={styles.fields}>
              <legend className={styles.legend}>1. Add your input</legend>
              {isExtractor && (
                <div className={styles.sourceToggle} role="group" aria-label="Input source">
                  <button type="button" aria-pressed={source === "magnet"} onClick={() => { setSource("magnet"); clearResult(); }}>Magnet link</button>
                  <button type="button" aria-pressed={source === "file"} onClick={() => { setSource("file"); clearResult(); }}>.torrent file</button>
                </div>
              )}
              {isMagnet && <label className={styles.field}>Info hash<input required value={hashInput} onChange={(event) => setHashInput(event.target.value)} placeholder="40 hex characters or 32 Base32 characters" autoComplete="off" spellCheck={false} maxLength={128} /><small>A BitTorrent v1 info hash, not a regular file checksum.</small></label>}
              {isExtractor && source === "magnet" && <label className={styles.field}>Magnet link<textarea required rows={4} value={magnetInput} onChange={(event) => setMagnetInput(event.target.value)} placeholder="magnet:?xt=urn:btih:…" spellCheck={false} maxLength={32768} /></label>}
              {showFileInput && (
                <label className={`${styles.field} ${styles.upload}`}>
                  {isCreator ? "Choose source files" : "Choose a .torrent file"}
                  <input required type="file" multiple={isCreator} accept={isCreator ? undefined : ".torrent,application/x-bittorrent"} onChange={(event) => setFiles(Array.from(event.target.files || []))} />
                  <small>{isCreator ? `Up to ${MAX_FILES.toLocaleString()} files, ${formatBytes(MAX_CONTENT_BYTES)} total. Files stay on your device.` : "Maximum 10 MiB. BitTorrent v1 and hybrid .torrent files."}</small>
                </label>
              )}
              {showFileInput && files.length > 0 && <p className={styles.selection}>{files.length} {files.length === 1 ? "file" : "files"} selected · {formatBytes(totalSize)}{files.length > 1 && " · Stored in selection order, in a single folder."}</p>}
              {(isCreator || isMagnet) && (
                <>
                  <label className={styles.field}>{isCreator ? "Torrent name (optional)" : "Display name (optional)"}<input value={name} onChange={(event) => setName(event.target.value)} placeholder={isCreator ? "Defaults to the file name or my-files" : "A readable name for your magnet"} maxLength={255} /></label>
                  <label className={styles.field}>Trackers (optional)<textarea rows={3} value={trackers} onChange={(event) => setTrackers(event.target.value)} placeholder="One tracker URL per line" maxLength={16384} spellCheck={false} /><small>HTTP(S), UDP, or WS(S). Leave blank for a trackerless public torrent.</small></label>
                </>
              )}
              {isCreator && (
                <>
                  <div className={styles.optionsRow}>
                    <label className={styles.field}>Piece size<select value={pieceLength} onChange={(event) => setPieceLength(Number(event.target.value))}>{[256, 512, 1024, 2048, 4096].map((size) => <option key={size} value={size * 1024}>{formatBytes(size * 1024)}{size === 256 ? " (default)" : ""}</option>)}</select></label>
                    <label className={styles.checkbox}><input type="checkbox" checked={privateTorrent} onChange={(event) => setPrivateTorrent(event.target.checked)} />Private torrent</label>
                  </div>
                  <label className={styles.field}>Comment (optional)<input value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} placeholder="A note included in the torrent metadata" /></label>
                  <p className={styles.hint}>Private torrents require a tracker. The private flag asks clients to disable decentralized peer discovery; it does not encrypt your files.</p>
                </>
              )}
              <div className={styles.actions}><button className={styles.primary} type="submit">{busy ? "Processing…" : action}</button><button type="button" className={styles.secondary} onClick={reset}>Reset</button></div>
            </fieldset>
          </form>
          {busy && isCreator && <div className={styles.progress}><label htmlFor="torrent-progress">Hashing files… {progress}%</label><progress id="torrent-progress" max={100} value={progress} /><button className={styles.secondary} type="button" onClick={cancel}>Cancel</button></div>}
          {error && <p className={styles.error} role="alert">{error}</p>}
          <p className={styles.status} role="status" aria-live="polite">{status}</p>
          {result && (
            <section className={styles.results} aria-labelledby="result-title">
              <h2 id="result-title">2. Your result</h2>
              {result.bytes && <button className={styles.primary} onClick={() => saveFile(result.bytes, `${result.summary.name}.torrent`, "application/x-bittorrent")}>Download .torrent</button>}
              <div className={styles.resultField}><label htmlFor="hex-result">Info hash · Hexadecimal</label><div><input id="hex-result" value={result.infoHash} readOnly spellCheck={false} /><button onClick={() => copy(result.infoHash, "Hexadecimal hash")}>Copy hash</button></div></div>
              <div className={styles.resultField}><label htmlFor="base32-result">Info hash · Base32</label><div><input id="base32-result" value={result.base32} readOnly spellCheck={false} /><button onClick={() => copy(result.base32, "Base32 hash")}>Copy Base32</button></div></div>
              <div className={styles.resultField}><label htmlFor="magnet-result">Magnet link</label><textarea id="magnet-result" rows={3} value={result.magnet} readOnly spellCheck={false} /><button className={styles.secondary} onClick={() => copy(result.magnet, "Magnet link")}>Copy magnet link</button></div>
              {result.summary && (
                <>
                  <dl className={styles.metadata}>
                    <div><dt>Name</dt><dd>{result.summary.name}</dd></div>
                    <div><dt>Total content size</dt><dd>{formatBytes(result.summary.totalSize)}</dd></div>
                    <div><dt>Piece size / count</dt><dd>{formatBytes(result.summary.pieceLength)} / {result.summary.pieceCount.toLocaleString()}</dd></div>
                    <div><dt>Private torrent</dt><dd>{result.summary.private ? "Yes" : "No"}</dd></div>
                    {result.summary.creationDate && <div><dt>Created (UTC)</dt><dd>{result.summary.creationDate}</dd></div>}
                    {result.summary.createdBy && <div><dt>Created by</dt><dd>{result.summary.createdBy}</dd></div>}
                    {result.summary.comment && <div><dt>Comment</dt><dd>{result.summary.comment}</dd></div>}
                  </dl>
                  {result.summary.private && <p className={styles.hint}>For private torrents, share the .torrent file according to your tracker’s instructions. A magnet link alone does not include its private flag.</p>}
                  <details className={styles.details} open={slug === "torrent-file-parser"}><summary>Files ({result.summary.files.length.toLocaleString()})</summary><div className={styles.tableWrap}><table><thead><tr><th>Path</th><th>Size</th></tr></thead><tbody>{result.summary.files.map((file) => <tr key={file.path}><td>{file.path}</td><td>{formatBytes(file.length)}</td></tr>)}</tbody></table></div></details>
                  <details className={styles.details}><summary>Trackers ({result.summary.trackers.length})</summary>{result.summary.trackers.length ? <ul>{result.summary.trackers.map((tracker) => <li key={tracker}>{tracker}</li>)}</ul> : <p>No trackers listed.</p>}</details>
                  <button className={styles.secondary} onClick={() => saveFile(JSON.stringify(result.summary, null, 2), "torrent-metadata.json", "application/json")}>Download metadata JSON</button>
                </>
              )}
            </section>
          )}
        </div>
        <aside className={styles.guide}>
          <h2>How to use this tool</h2><p>{config.help}</p>
          <div className={styles.localBadge}>Processed on your device</div>
          <p>Your file contents are processed in this browser. These tools do not upload files or contact trackers.</p>
          <h3>Good to know</h3>
          <p>{isCreator ? "Keep your original files after creating a torrent. A BitTorrent client needs them to seed. Multiple files are stored in one folder; folder uploads are not supported." : "Supports BitTorrent v1 and v1 hashes from hybrid torrents. V2-only torrents are not supported."}</p>
          <h3>More torrent tools</h3>
          <nav aria-label="Related torrent tools">{torrentTools.filter((tool) => tool.slug !== slug).map((tool) => <a href={`/torrent/${tool.slug}`} key={tool.slug}>{tool.name}<span aria-hidden="true">→</span></a>)}</nav>
        </aside>
      </div>
    </>
  );
}

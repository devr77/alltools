"use client";

import { useEffect, useRef } from "react";
import Icon from "./Icon";

/** Big Buck Bunny (© Blender Foundation, CC BY 3.0) as an HLS test stream from Mux, which allows cross-origin reads. */
export const SAMPLE_STREAM = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

/** The ?url= another tool handed over, read once after mount (the pages are static, so it can't come from the server). */
export function useStreamParam(onFound: (url: string) => void) {
  const handled = useRef(false);
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    const url = new URLSearchParams(window.location.search).get("url");
    if (url) onFound(url);
  }, [onFound]);
}

/** Address to open the same stream in another tool. */
export const withStream = (href: string, url: string) => `${href}?url=${encodeURIComponent(url)}`;

export default function UrlForm({ id, value, onChange, onSubmit, busy, disabled = false, action, busyLabel }: {
  id: string; value: string; onChange: (value: string) => void; onSubmit: (value: string) => void;
  /** busy: loading, so the button says busyLabel; disabled: another task (a download) is running. */
  busy: boolean; disabled?: boolean; action: string; busyLabel: string;
}) {
  return (
    <form className="url-form" onSubmit={(event) => { event.preventDefault(); onSubmit(value); }}>
      <label htmlFor={id}>M3U8 playlist URL</label>
      <div className="url-row">
        <span className="url-icon"><Icon name="stream" size={18} /></span>
        <input
          id={id} type="url" inputMode="url" autoComplete="off" spellCheck={false} required
          placeholder="https://example.com/video/master.m3u8" value={value} onChange={(event) => onChange(event.target.value)}
        />
        <button className="button" type="submit" disabled={busy || disabled}>{busy ? busyLabel : action}</button>
      </div>
      <p className="url-hint">
        No link handy?{" "}
        <button type="button" className="link-button" disabled={busy || disabled} onClick={() => { onChange(SAMPLE_STREAM); onSubmit(SAMPLE_STREAM); }}>Try a sample stream</button>
        {" "}(Big Buck Bunny, CC BY).
      </p>
    </form>
  );
}

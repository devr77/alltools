"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type Fuse from "fuse.js";
import { usePostHog } from "posthog-js/react";
import type { SearchTool } from "@/app/lib/tool-index";
import styles from "./SiteSearch.module.css";

// Shown before anything is typed.
const SUGGESTED = ["JSON Formatter & Validator", "Random Password Generator", "QR Code Generator", "HLS Downloader", "Image to URL", "File to URL"];

// Some tools use two emoji (🌐➡️); the result list has room for one.
const firstEmoji = (icon: string) =>
  typeof Intl !== "undefined" && "Segmenter" in Intl ? [...new Intl.Segmenter().segment(icon)][0]?.segment ?? icon : icon;

function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

/** Header search: a small icon (or Cmd/Ctrl+K) that opens a dialog searching every tool on the site, Share and HLS included. */
export default function SiteSearch({ tools }: { tools: SearchTool[] }) {
  const posthog = usePostHog();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [fuse, setFuse] = useState<Fuse<SearchTool> | null>(null);
  const listId = useId();
  const term = query.trim();

  const open = useCallback(() => {
    setQuery("");
    setActive(0);
    dialog.current?.showModal();
    input.current?.focus();
    // Fuse loads on first use, so pages that never search don't download it.
    if (!fuse) {
      import("fuse.js").then(({ default: FuseClass }) => {
        setFuse(new FuseClass(tools, { keys: ["name", "category", "keywords"], ignoreFieldNorm: true, threshold: 0.3 }));
      });
    }
  }, [fuse, tools]);
  const close = () => dialog.current?.close();

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else open();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [open]);

  const results = useMemo(() => {
    if (!term) return SUGGESTED.flatMap((name) => tools.filter((tool) => tool.name === name));
    if (fuse) return fuse.search(term).map((result) => result.item);
    const lower = term.toLowerCase();
    return tools.filter((tool) => tool.name.toLowerCase().includes(lower));
  }, [term, fuse, tools]);

  useEffect(() => {
    if (!term) return;
    const timeout = window.setTimeout(() => {
      posthog?.capture("tool_search", { search_term: term, search_length: term.length, has_results: results.length > 0, source: "header" });
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [term, results.length, posthog]);

  // Keep the highlighted result in view while moving with the arrow keys.
  useEffect(() => {
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (current + step + results.length) % Math.max(results.length, 1));
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      list.current?.querySelector<HTMLAnchorElement>(`[data-index="${active}"] a`)?.click();
    }
  };

  return (
    <>
      <button type="button" className={styles.trigger} onClick={open} aria-label="Search tools" title="Search tools (⌘K / Ctrl K)">
        <SearchIcon />
      </button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label="Search tools"
        // A click on the backdrop lands on the dialog itself, outside its box.
        onClick={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close();
        }}
      >
        <div className={styles.inputRow}>
          <SearchIcon size={20} />
          <input
            ref={input}
            // Not type="search": there, Escape clears the text instead of closing the dialog.
            type="text"
            inputMode="search"
            enterKeyHint="go"
            role="combobox"
            aria-label="Search tools"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
            placeholder={`Search ${tools.length} tools…`}
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActive(0); }}
            onKeyDown={onKeyDown}
          />
          <button type="button" className={styles.close} onClick={close} aria-label="Close search">Esc</button>
        </div>
        {results.length ? (
          <>
            <p className={styles.label}>{term ? `${results.length} ${results.length === 1 ? "tool" : "tools"}` : "Popular tools"}</p>
            <ul ref={list} id={listId} role="listbox" aria-label="Tools" className={styles.results}>
              {results.map((tool, index) => {
                const content = (
                  <>
                    <span className={styles.icon} aria-hidden="true">{firstEmoji(tool.icon)}</span>
                    <span className={styles.text}>
                      <strong>{tool.name}</strong>
                      <small>{tool.category} · {tool.description}</small>
                    </span>
                  </>
                );
                return (
                  <li
                    key={tool.href}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={index === active}
                    data-index={index}
                    className={styles.result}
                    onMouseMove={() => setActive(index)}
                  >
                    {tool.href.startsWith("/")
                      ? <Link href={tool.href} tabIndex={-1} onClick={close}>{content}</Link>
                      : <a href={tool.href} tabIndex={-1} onClick={close}>{content}</a>}
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className={styles.empty} role="status">No tools match “{term}”. Try a shorter word, like “json” or “video”.</p>
        )}
        <p className={styles.hints} aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></p>
      </dialog>
    </>
  );
}

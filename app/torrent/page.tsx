import type { Metadata } from "next";
import { torrentTools } from "./tools";
import styles from "./Torrent.module.css";

export const metadata: Metadata = {
  title: "Torrent & Hashing Tools | ToolsBase",
  description: "Create magnet links, inspect torrent files, calculate info hashes, and build v1 torrents locally in your browser.",
  alternates: { canonical: "/torrent" },
};
export default function Page() {
  return (
    <>
      <header className={styles.header}>
        <span className={styles.eyebrow}>YOUR FILES. YOUR BROWSER.</span>
        <h1>Torrent &amp; Hashing Tools</h1>
        <p>Create, inspect, and share torrent metadata with free browser utilities. Calculate, inspect, or connect to compatible peers.</p>
      </header>
      <div className={styles.catalog}>
        {torrentTools.map((tool) => (
          <a key={tool.slug} href={`/torrent/${tool.slug}`} className={styles.catalogCard}>
            <span aria-hidden="true">{tool.icon}</span><h2>{tool.name}</h2><p>{tool.description}</p><strong>Open tool →</strong>
          </a>
        ))}
      </div>
      <p className={styles.note}>Supports BitTorrent v1 metadata and the v1 portion of hybrid torrents. Metadata tools run locally. The browser downloader and health checker connect to peers only when you start them.</p>
    </>
  );
}

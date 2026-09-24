import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Torrent.module.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/torrent">Torrent &amp; Hashing</Link>
      </nav>
      {children}
      <aside className={styles.termsNotice} aria-labelledby="torrent-terms-heading">
        <h2 id="torrent-terms-heading">Terms of use &amp; educational disclaimer</h2>
        <p>These tools are designed for lawful, educational, and open-source data management purposes. Use them only with content you own, content in the public domain, or content you have permission to access and share.</p>
        <p>Do not use these tools to infringe copyright or distribute unauthorized content. You are responsible for following applicable laws and content licenses. Tools and estimates are provided as is; they do not guarantee content safety, availability, or accuracy.</p>
      </aside>
    </div>
  );
}

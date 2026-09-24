import Link from "next/link";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div>
            <Link href="/" className={styles.brand}>ToolsBase</Link>
            <p>Simple tools for the things you do every day.</p>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/#tool-directory">All tools</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy policy</Link>
          </nav>
        </div>
        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} ToolsBase. All rights reserved.</p>
          <p>Tools are provided “as is”, without warranties. No affiliation with third-party brands.</p>
        </div>
      </div>
    </footer>
  );
}

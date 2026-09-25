import "./share.css";
import Link from "next/link";
import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Icon from "./Icon";
import { findTool, navSlugs, site, tools } from "./catalog";

// /share sits outside the app/(site) route group, so it gets this header and footer instead of the main site's.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  publisher: site.brand,
  openGraph: { siteName: site.brand, type: "website" },
  twitter: { card: "summary" },
};

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display" });

const media = ["image-to-url", "video-to-url", "gif-to-url", "audio-to-url", "screenshot-to-url"].map(findTool);
const docs = tools.filter((tool) => !media.includes(tool));

function Brand() {
  return (
    <Link className="brand" href={site.home}>
      <span className="logo"><Icon name="link" size={18} /></span>
      <span><b>{site.brand}</b></span>
    </Link>
  );
}

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`share-root ${display.variable}`}>
      <a className="skip" href="#share-main">Skip to content</a>
      <header className="topbar">
        <div className="inner">
          <Brand />
          <nav aria-label="Share tools">
            {navSlugs.map(findTool).map((tool) => (
              <Link key={tool.slug} href={`${site.path}/${tool.slug}`} style={{ "--dot": tool.hue[0] } as React.CSSProperties}>{tool.name}</Link>
            ))}
            <Link href={`${site.home}#all-tools`}>All tools</Link>
          </nav>
        </div>
      </header>

      <main id="share-main" className="share-page-wrap">
        {children}
        <aside className="notice" aria-labelledby="notice-heading">
          <div className="inner">
            <span className="notice-icon"><Icon name="shield" size={20} /></span>
            <div>
              <h2 id="notice-heading">Acceptable use</h2>
              <p>
                Upload only content you own or have permission to share. Illegal content, malware, phishing, and content that
                infringes someone else&apos;s rights are not allowed and will be removed. Links are public to anyone who has them,
                and they are deleted automatically when they expire. To report a link, <Link href={site.contactUrl}>contact us</Link> with the URL.
              </p>
            </div>
          </div>
        </aside>
      </main>

      <footer className="footer">
        <div className="spectrum" aria-hidden="true">
          {tools.map((tool) => <span key={tool.slug} style={{ background: tool.hue[0] }} />)}
        </div>
        <div className="inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <Brand />
              <p>Temporary links for files, media, and text. Upload, share, and let it expire.</p>
            </div>
            <nav aria-label="Media tools">
              <h2>Media</h2>
              {media.map((tool) => <Link key={tool.slug} href={`${site.path}/${tool.slug}`}>{tool.name}</Link>)}
            </nav>
            <nav aria-label="Document and data tools">
              <h2>Documents &amp; data</h2>
              {docs.map((tool) => <Link key={tool.slug} href={`${site.path}/${tool.slug}`}>{tool.name}</Link>)}
            </nav>
            <nav aria-label="Help and policies">
              <h2>Help</h2>
              <Link href={`${site.main}/about`}>About</Link>
              <Link href={`${site.main}/privacy`}>Privacy policy</Link>
              <Link href={site.contactUrl}>Contact &amp; report abuse</Link>
            </nav>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} {site.brand}. All rights reserved.</p>
            <p>Provided “as is”, without warranties. Uploads are deleted automatically when their link expires.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import "./hls.css";
import Link from "next/link";
import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import Icon from "./Icon";
import { findTool, navSlugs, site, tools } from "./catalog";
import type { Place } from "./place";

// Header and footer for HLS, used by app/hls/layout.tsx (toolsbase.org/hls) and app/hls-domain/layout.tsx.
// Both sit outside the app/(site) route group, so the main site's header and footer don't render.
export const shellMetadata: Metadata = {
  metadataBase: new URL(site.url),
  publisher: site.brand,
  openGraph: { siteName: site.brand, type: "website" },
  twitter: { card: "summary" },
};

// HLS ships its own dark theme, so browsers with forced/auto dark mode use hls.css's dark tokens instead of inverting.
export const shellViewport: Viewport = { colorScheme: "light dark" };

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });

function Brand({ place }: { place: Place }) {
  return (
    <Link className="brand" href={place.home}>
      <span className="logo"><Icon name="stream" size={18} /></span>
      <span>HLS <b>Tools</b></span>
    </Link>
  );
}

export default function HlsShell({ place, children }: { place: Place; children: React.ReactNode }) {
  return (
    <div className={`hls-root ${display.variable}`}>
      <a className="skip" href="#hls-main">Skip to content</a>
      <header className="topbar">
        <div className="inner">
          <Brand place={place} />
          <nav aria-label="HLS tools">
            {navSlugs.map(findTool).map((tool) => (
              <Link key={tool.slug} href={`${place.path}/${tool.slug}`} style={{ "--dot": tool.hue[0] } as React.CSSProperties}>{tool.name}</Link>
            ))}
          </nav>
        </div>
      </header>

      <main id="hls-main" className="hls-main">
        {children}
        <aside className="notice" aria-labelledby="notice-heading">
          <div className="inner">
            <span className="notice-icon"><Icon name="alert" size={20} /></span>
            <div>
              <h2 id="notice-heading">Acceptable use</h2>
              <p>
                Use these tools only with streams and files you own, have permission to save, or that are in the public domain. They
                don&apos;t bypass DRM, logins, or paywalls, and you&apos;re responsible for following each site&apos;s terms and copyright law.
                Streams load directly from their source into your browser; ToolsBase doesn&apos;t host, proxy, or store any video.
                Questions or concerns? <Link href={`${place.main}/contact`}>Contact us</Link>.
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
              <Brand place={place} />
              <p>Download, play, and inspect HLS streams in your browser. No uploads, no account.</p>
            </div>
            <nav aria-label="Stream tools">
              <h2>Tools</h2>
              {tools.map((tool) => <Link key={tool.slug} href={`${place.path}/${tool.slug}`}>{tool.name}</Link>)}
            </nav>
            <nav aria-label="Help and policies">
              <h2>Help</h2>
              <Link href={`${place.main}/about`}>About</Link>
              <Link href={`${place.main}/privacy`}>Privacy policy</Link>
              <Link href={`${place.main}/contact`}>Contact</Link>
            </nav>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} ToolsBase. All rights reserved.</p>
            <p>Provided “as is”, without warranties.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

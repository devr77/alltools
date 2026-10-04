/** Server-rendered page sections shared by the HLS hub and tool pages. */
import Link from "next/link";
import Icon from "./Icon";
import Downloader from "./Downloader";
import Player from "./Player";
import Checker from "./Checker";
import TsConverter from "./TsConverter";
import type { HlsTool } from "./catalog";
import { toolLinks, type Place } from "./place";

// Page hues go in their own variables; hls.css maps them to --a1/--a2 per color scheme (an inline --a1 would win over dark mode).
export const hueStyle = ([hue1, hue2]: string[]) => ({ "--hue1": hue1, "--hue2": hue2 }) as React.CSSProperties;

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export const breadcrumb = (items: [string, string][]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, item], index) => ({ "@type": "ListItem", position: index + 1, name, item })),
});

export const faqPage = (faqs: string[][]) => ({
  "@type": "FAQPage",
  mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
});

export function Eyebrow({ index, children }: { index?: string; children: React.ReactNode }) {
  return <p className="eyebrow">{index && <span>{index}</span>}{children}</p>;
}

export function TrustRow() {
  return (
    <ul className="trust">
      <li><Icon name="zap" size={16} /> Runs in your browser</li>
      <li><Icon name="shield" size={16} /> Nothing uploaded</li>
      <li><Icon name="user" size={16} /> No account</li>
    </ul>
  );
}

const facts: Record<HlsTool["mode"], [string, string, string][]> = {
  download: [["video", "Output", "MP4 or TS, original quality"], ["lock", "Encryption", "AES-128 supported, DRM not"], ["shield", "Private", "Built on your device"]],
  player: [["layers", "Quality", "Auto or locked rendition"], ["stream", "Streams", "VOD and live HLS"], ["shield", "Private", "Plays straight from the source"]],
  checker: [["list", "Reads", "Master and media playlists"], ["alert", "Flags", "Spec issues, DRM, CORS"], ["zap", "Light", "Fetches playlists only"]],
  convert: [["convert", "Output", "MP4, no re-encoding"], ["video", "Input", "H.264 + AAC in .ts"], ["shield", "Private", "Files never leave your device"]],
};

export function ToolPanel({ tool, place, heading }: { tool: HlsTool; place: Place; heading: string }) {
  const links = toolLinks(place);
  return (
    <div className="panel">
      <h2 className="visually-hidden">{heading}</h2>
      {tool.mode === "download" ? <Downloader links={links} />
        : tool.mode === "player" ? <Player links={links} />
        : tool.mode === "checker" ? <Checker links={links} />
        : <TsConverter />}
      <ul className="facts">
        {facts[tool.mode].map(([icon, label, text]) => <li key={label}><Icon name={icon} size={15} /><span><b>{label}</b> {text}</span></li>)}
      </ul>
    </div>
  );
}

export function Steps({ index, title, steps }: { index: string; title: string; steps: string[][] }) {
  return (
    <section className="section">
      <div className="inner">
        <Eyebrow index={index}>How it works</Eyebrow>
        <h2 className="section-title">{title}</h2>
        <ol className="steps">
          {steps.map(([heading, text], position) => (
            <li key={heading}><span className="step-number">{String(position + 1).padStart(2, "0")}</span><h3>{heading}</h3><p>{text}</p></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export const sharedFeatures: [string, string, string][] = [
  ["shield", "Private by design", "Streams and files go straight between your browser and their source. ToolsBase never sees them."],
  ["user", "No account, no install", "Works in any modern browser on desktop or phone. There's nothing to sign up for or download."],
  ["lock", "No DRM circumvention", "Protected streams are refused. The tools work with open HLS and standard AES-128 only."],
];

export function Features({ index, eyebrow, title, cards }: { index: string; eyebrow: string; title: string; cards: [string, string, string][] }) {
  return (
    <section className="section section-tint">
      <div className="inner">
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
        <h2 className="section-title">{title}</h2>
        <div className="feature-list">
          {cards.map(([name, heading, text]) => (
            <article key={heading} className="feature">
              <span className="feature-icon"><Icon name={name} size={20} /></span>
              <div><h3>{heading}</h3><p>{text}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function About({ index, tool }: { index: string; tool: HlsTool }) {
  return (
    <section className="section">
      <div className="inner about">
        <div>
          <Eyebrow index={index}>About</Eyebrow>
          <h2 className="section-title">What is the {tool.name}{tool.mode === "convert" ? " converter" : ""}?</h2>
          {tool.intro.map((text) => <p key={text}>{text}</p>)}
        </div>
        <div className="use-cases">
          <h3>Popular uses</h3>
          <ul>
            {tool.useCases.map(([heading, text]) => (
              <li key={heading}><span><Icon name="check" size={14} /></span><div><strong>{heading}</strong><p>{text}</p></div></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Faq({ index, faqs, title }: { index: string; faqs: string[][]; title: string }) {
  return (
    <section className="section" id="faq">
      <div className="inner faq-layout">
        <div>
          <Eyebrow index={index}>FAQ</Eyebrow>
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="faq">
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary><h3>{question}</h3><span className="plus" aria-hidden="true" /></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ToolGrid({ path, index, list, title, subtitle, id }: { path: string; index: string; list: HlsTool[]; title: string; subtitle: string; id?: string }) {
  return (
    <section className="section section-tint" id={id}>
      <div className="inner">
        <Eyebrow index={index}>{id ? "All tools" : "More tools"}</Eyebrow>
        <h2 className="section-title">{title}</h2>
        <p className="section-sub">{subtitle}</p>
        <div className="tool-grid">
          {list.map((tool) => (
            <Link key={tool.slug} className="tool-card" href={`${path}/${tool.slug}`} style={hueStyle(tool.hue)}>
              <span className="tool-icon"><Icon name={tool.icon} size={20} /></span>
              <strong>{tool.name}</strong>
              <small>{tool.lead.split(/(?<=\.)\s/)[0]}</small>
              <span className="tool-go" aria-hidden="true">Open →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

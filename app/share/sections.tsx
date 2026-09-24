/** Server-rendered page sections shared by the /share hub and tool pages. */
import Link from "next/link";
import Icon from "./Icon";
import Uploader, { type UploaderSettings } from "./Uploader";
import { limitLabel, site, type ShareTool } from "./catalog";

const settings: UploaderSettings = {
  api: site.api, uploadWindow: site.uploadWindow, maxBytes: site.maxBytes, maxFiles: site.maxFiles,
  lifetimes: site.lifetimes, defaultLifetime: site.defaultLifetime,
};

export const lifetimes = site.lifetimes.map((entry) => entry.label).join(" or ");
export const hueStyle = ([a1, a2]: string[]) => ({ "--a1": a1, "--a2": a2 }) as React.CSSProperties;

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
      <li><Icon name="zap" size={16} /> Link in seconds</li>
      <li><Icon name="clock" size={16} /> Deletes itself</li>
      <li><Icon name="user" size={16} /> No account</li>
    </ul>
  );
}

export function UploadCard({ tool, heading }: { tool: ShareTool; heading: string }) {
  const limit = tool.mode === "file" ? `${limitLabel} per file` : `Up to ${limitLabel}`;
  return (
    <div className="upload-card">
      <h2 className="visually-hidden">{heading}</h2>
      {/* Only the fields the uploader needs, not the page's SEO copy. */}
      <Uploader settings={settings} tool={{
        slug: tool.slug, name: tool.name, mode: tool.mode, accept: tool.accept, picker: tool.picker, label: tool.label, formats: tool.formats,
        pasteFirst: tool.pasteFirst, textType: tool.textType, extension: tool.extension, json: tool.json, placeholder: tool.placeholder,
      } as ShareTool} />
      <ul className="facts">
        <li><Icon name="zap" size={15} /><span><b>Limit</b> {limit}</span></li>
        <li><Icon name="clock" size={15} /><span><b>Lifetime</b> {site.lifetimes.map((entry) => entry.label).join(" or ")}</span></li>
        <li><Icon name="sparkle" size={15} /><span><b>Formats</b> {tool.formats}</span></li>
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
  ["clock", "Links that clean up after themselves", `Every upload is deleted automatically after ${lifetimes}, so nothing lingers.`],
  ["user", "No account, no email", "Upload and share straight away. There's nothing to sign up for or log in to."],
  ["shield", "HTTPS everywhere", "Uploads and links use encrypted HTTPS connections from end to end."],
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

export function About({ index, tool }: { index: string; tool: ShareTool }) {
  return (
    <section className="section">
      <div className="inner about">
        <div>
          <Eyebrow index={index}>About</Eyebrow>
          <h2 className="section-title">What is {tool.name}?</h2>
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

export function ToolGrid({ index, list, title, subtitle, id }: { index: string; list: ShareTool[]; title: string; subtitle: string; id?: string }) {
  return (
    <section className="section section-tint" id={id}>
      <div className="inner">
        <Eyebrow index={index}>{id ? "All tools" : "More tools"}</Eyebrow>
        <h2 className="section-title">{title}</h2>
        <p className="section-sub">{subtitle}</p>
        <div className="tool-grid">
          {list.map((tool) => (
            <Link key={tool.slug} className="tool-card" href={`${site.path}/${tool.slug}`} style={hueStyle(tool.hue)}>
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

import type { Metadata } from "next";
import { findTool, sharedFaqs, site, tools } from "./catalog";
import type { Place } from "./place";
import { Eyebrow, Faq, faqPage, Features, hueStyle, JsonLd, lifetimes, sharedFeatures, Steps, ToolGrid, TrustRow, UploadCard } from "./sections";

export const hubMetadata: Metadata = {
  title: site.title,
  description: site.description,
  alternates: { canonical: site.url },
  openGraph: { title: site.title, description: site.description, url: site.url },
  twitter: { title: site.title, description: site.description },
};

export default function HubPage({ place }: { place: Place }) {
  const faqs = sharedFaqs();
  return (
    <div className="share-page" style={hueStyle(["#0f766e", "#f97316"])}>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage", name: site.name, description: site.description, url: site.url,
            isPartOf: { "@type": "WebSite", name: site.brand, url: site.url },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: tools.map((tool, index) => ({ "@type": "ListItem", position: index + 1, name: tool.name, url: `${site.url}/${tool.slug}` })),
            },
          },
          faqPage(faqs),
        ],
      }} />
      <section className="hero">
        <div className="inner hero-center">
          <Eyebrow>Free · No account · Links that expire</Eyebrow>
          <h1>Upload a file, <mark>get a link</mark></h1>
          <p className="lead">Share images, videos, PDFs, audio, documents, or plain text as a link in seconds. Each link lasts {lifetimes}, then the file deletes itself.</p>
          <UploadCard tool={findTool("file-to-url")} heading="Upload your file" />
          <TrustRow />
        </div>
      </section>
      <ToolGrid path={place.path} index="01" list={tools} id="all-tools" title="Pick a tool for your content" subtitle="Each tool is tuned for one kind of content, with the right formats, previews, and tips." />
      <Steps index="02" title="Share anything in three steps" steps={[
        ["Add your content", "Drop files, click to browse, paste from the clipboard, or use a text tool."],
        ["Choose the lifetime", `Keep the link for ${lifetimes}. It's deleted automatically afterwards.`],
        ["Copy and share", "Paste the link into chat, email, a ticket, or code. No sign-in needed to open it."],
      ]} />
      <Features index="03" eyebrow="Why temporary links" title="Built for sharing, not storing" cards={sharedFeatures} />
      <Faq index="04" faqs={faqs} title="Frequently asked questions" />
    </div>
  );
}

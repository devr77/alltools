import type { Metadata } from "next";
import { findTool, site, tools } from "./catalog";
import type { Place } from "./place";
import { Eyebrow, Faq, faqPage, Features, hueStyle, JsonLd, sharedFeatures, Steps, ToolGrid, ToolPanel, TrustRow } from "./sections";

export const hubMetadata: Metadata = {
  title: site.title,
  description: site.description,
  alternates: { canonical: site.url },
  openGraph: { title: site.title, description: site.description, url: site.url },
  twitter: { title: site.title, description: site.description },
};

const hubFaqs = [
  ["What is HLS?", "HTTP Live Streaming (HLS) is the most common way video is streamed on the web. Instead of one file, the video is cut into short segments listed in an .m3u8 playlist, often in several qualities, so players can switch quality as your connection changes."],
  ["What is an M3U8 file?", "A plain-text playlist. A master M3U8 lists the available qualities; a media M3U8 lists the segment files of one quality, with their durations and any encryption keys. It contains no video itself."],
  ["Do these tools upload my streams or files?", "No. Everything runs in your browser. Streams load directly from their source, and local files never leave your device."],
  ["Why does a stream fail to load here?", "The stream's server must allow other websites to read it (CORS). Many do, but streams locked to their own site, expired links, and DRM-protected streams can't be loaded. The error message says which applies."],
  ...findTool("hls-downloader").faqs.filter(([question]) => question.startsWith("Is it legal")),
];

export default function HubPage({ place }: { place: Place }) {
  const downloader = findTool("hls-downloader");
  return (
    <div className="hls-page" style={hueStyle(["#4f46e5", "#67e8f9"])}>
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
          faqPage(hubFaqs),
        ],
      }} />
      <section className="hero">
        <div className="inner hero-center">
          <Eyebrow>Free · In your browser · No uploads</Eyebrow>
          <h1>Download and play <mark>HLS streams</mark></h1>
          <p className="lead">Paste an .m3u8 link to save it as MP4, play it, or see exactly what&apos;s inside. Everything runs on your device, with nothing to install.</p>
          <ToolPanel tool={downloader} place={place} heading="Download an HLS stream" />
          <TrustRow />
        </div>
      </section>
      <ToolGrid path={place.path} index="01" list={tools} id="all-tools" title="Tools for HLS and M3U8" subtitle="Each tool handles one job, and you can pass a stream from one to the next." />
      <Steps index="02" title="From playlist to file in three steps" steps={downloader.steps} />
      <Features index="03" eyebrow="Why these tools" title="Straight from the stream to you" cards={sharedFeatures} />
      <Faq index="04" faqs={hubFaqs} title="Frequently asked questions" />
    </div>
  );
}

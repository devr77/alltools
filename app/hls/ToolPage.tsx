import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findTool, site, tools } from "./catalog";
import type { Place } from "./place";
import { About, breadcrumb, Faq, faqPage, Features, hueStyle, JsonLd, sharedFeatures, Steps, ToolGrid, ToolPanel, TrustRow } from "./sections";

export type ToolProps = { params: Promise<{ tool: string }> };

// Route exports for app/hls/[tool]/page.tsx and app/hls-domain/[tool]/page.tsx.
export const toolParams = () => tools.map((tool) => ({ tool: tool.slug }));

export async function toolMetadata({ params }: ToolProps): Promise<Metadata> {
  const tool = findTool((await params).tool);
  if (!tool) return {};
  const url = `${site.url}/${tool.slug}`;
  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical: url },
    openGraph: { title: tool.title, description: tool.description, url },
    twitter: { title: tool.title, description: tool.description },
  };
}

const headings = { download: "Download a stream", player: "Play a stream", checker: "Check a playlist", convert: "Convert TS files" };

export default async function ToolPage({ place, params }: ToolProps & { place: Place }) {
  const tool = findTool((await params).tool);
  if (!tool) notFound();
  const url = `${site.url}/${tool.slug}`;
  const features: [string, string, string][] = [
    ...tool.features.map(([title, text], index) => [["zap", "sparkle", "layers"][index % 3], title, text] as [string, string, string]),
    ...sharedFeatures,
  ];
  return (
    <div className="hls-page" style={hueStyle(tool.hue)}>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebApplication", name: tool.name, description: tool.description, url,
            applicationCategory: "MultimediaApplication", operatingSystem: "Any (web browser)", browserRequirements: "Requires JavaScript",
            isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            isPartOf: { "@type": "WebSite", name: site.brand, url: site.url },
          },
          faqPage(tool.faqs),
          breadcrumb([[site.brand, site.url], [tool.name, url]]),
        ],
      }} />
      <section className="hero">
        <div className="inner hero-center">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href={place.home}>{site.brand}</Link>
            <span aria-hidden="true">/</span><span aria-current="page">{tool.name}</span>
          </nav>
          <h1><mark>{tool.h1[0]}</mark>{tool.h1[1]}</h1>
          <p className="lead">{tool.lead}</p>
          <ToolPanel tool={tool} place={place} heading={headings[tool.mode]} />
          <TrustRow />
        </div>
      </section>
      <Steps index="01" title={`How to use the ${tool.name}${tool.mode === "convert" ? " converter" : ""}`} steps={tool.steps} />
      <About index="02" tool={tool} />
      <Features index="03" eyebrow="Features" title={`Why use this ${tool.name} tool`} cards={features} />
      <Faq index="04" faqs={tool.faqs} title={`${tool.name}: frequently asked questions`} />
      <ToolGrid path={place.path} index="05" list={tools.filter((entry) => entry.slug !== tool.slug)} title="More HLS tools" subtitle="Pass the same stream to another tool, or convert what you've saved." />
    </div>
  );
}

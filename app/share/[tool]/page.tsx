import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findTool, sharedFaqs, site, tools, type ShareTool } from "../catalog";
import { About, breadcrumb, Faq, faqPage, Features, hueStyle, JsonLd, lifetimes, sharedFeatures, Steps, ToolGrid, TrustRow, UploadCard } from "../sections";

type Props = { params: Promise<{ tool: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((tool) => ({ tool: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = findTool((await params).tool);
  if (!tool) return {};
  const path = `${site.path}/${tool.slug}`;
  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical: path },
    openGraph: { title: tool.title, description: tool.description, url: path },
    twitter: { title: tool.title, description: tool.description },
  };
}

function howToSteps(tool: ShareTool) {
  const first = tool.mode === "text" ? ["Paste your text", `Type or paste the ${tool.label} you want to share${tool.json ? ". It's validated as you go" : ""}.`]
    : tool.mode === "base64" ? ["Paste the Base64", "Paste a raw Base64 string or a full data: URI. It's decoded in your browser."]
    : tool.pasteFirst ? ["Paste your screenshot", "Press Ctrl+V (⌘V on Mac) after taking a screenshot, or drop an image file."]
    : [`Add ${tool.label}`, `Drag and drop, click to browse, or paste. ${tool.formats} ${tool.formats.includes(",") ? "are" : "is"} supported.`];
  return [
    first,
    ["Choose the lifetime", `Keep the link for ${lifetimes}. The file is deleted automatically afterwards.`],
    ["Copy and share", "Copy the link, open it to check it, and paste it anywhere. Recent links stay listed in this browser."],
  ];
}

export default async function ShareToolPage({ params }: Props) {
  const tool = findTool((await params).tool);
  if (!tool) notFound();
  const url = `${site.url}/${tool.slug}`;
  const faqs = [...tool.faqs, ...sharedFaqs()];
  const heading = tool.mode === "file" ? `Upload your ${tool.label.replace(/^an? /, "")}` : "Create your link";
  const features: [string, string, string][] = [
    ...tool.features.map(([title, text], index) => [["zap", "sparkle", "link"][index % 3], title, text] as [string, string, string]),
    ...sharedFeatures,
  ];
  return (
    <div className="share-page" style={hueStyle(tool.hue)}>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebApplication", name: `${tool.name} Converter`, description: tool.description, url,
            applicationCategory: "UtilitiesApplication", operatingSystem: "Any (web browser)", browserRequirements: "Requires JavaScript",
            isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            isPartOf: { "@type": "WebSite", name: site.brand, url: site.url },
          },
          faqPage(faqs),
          breadcrumb([["ToolsBase", "https://toolsbase.org/"], ["Share", site.url], [tool.name, url]]),
        ],
      }} />
      <section className="hero">
        <div className="inner hero-center">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">ToolsBase</Link><span aria-hidden="true">/</span><Link href={site.path}>Share</Link>
            <span aria-hidden="true">/</span><span aria-current="page">{tool.name}</span>
          </nav>
          <h1><mark>{tool.name}</mark> Converter</h1>
          <p className="lead">{tool.lead}</p>
          <UploadCard tool={tool} heading={heading} />
          <TrustRow />
        </div>
      </section>
      <Steps index="01" title={`How to convert ${tool.noun || tool.label} to a URL`} steps={howToSteps(tool)} />
      <About index="02" tool={tool} />
      <Features index="03" eyebrow="Features" title={`Why use this ${tool.name} tool`} cards={features} />
      <Faq index="04" faqs={faqs} title={`${tool.name}: frequently asked questions`} />
      <ToolGrid index="05" list={tools.filter((entry) => entry.slug !== tool.slug)} title="More free link tools" subtitle="Share other kinds of content the same way." />
    </div>
  );
}

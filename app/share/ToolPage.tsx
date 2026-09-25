import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findTool, sharedFaqs, site, tools, type ShareTool } from "./catalog";
import type { Place } from "./place";
import { About, breadcrumb, Faq, faqPage, Features, hueStyle, JsonLd, lifetimes, localFeatures, sharedFeatures, Steps, ToolGrid, TrustRow, UploadCard } from "./sections";

export type ToolProps = { params: Promise<{ tool: string }> };

// Route exports for app/share/[tool]/page.tsx and app/share-domain/[tool]/page.tsx.
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

function howToSteps(tool: ShareTool) {
  if (tool.mode === "qr") {
    return [
      ["Add the QR code", "Drop or choose an image, paste a screenshot with Ctrl+V, or scan with your camera."],
      ["Check what it holds", "The link, text, or Wi‑Fi details appear instantly, with warnings for anything suspicious."],
      ["Copy or open", "Copy the contents, or open the link once you're happy with where it goes."],
    ];
  }
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

export default async function ToolPage({ place, params }: ToolProps & { place: Place }) {
  const tool = findTool((await params).tool);
  if (!tool) notFound();
  const url = `${site.url}/${tool.slug}`;
  const local = tool.mode === "qr";
  const faqs = local ? tool.faqs : [...tool.faqs, ...sharedFaqs()];
  const heading = local ? "Scan your QR code" : tool.mode === "file" ? `Upload your ${tool.label.replace(/^an? /, "")}` : "Create your link";
  const features: [string, string, string][] = [
    ...tool.features.map(([title, text], index) => [["zap", "sparkle", "link"][index % 3], title, text] as [string, string, string]),
    ...(local ? localFeatures : sharedFeatures),
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
          breadcrumb([[site.brand, site.url], [tool.name, url]]),
        ],
      }} />
      <section className="hero">
        <div className="inner hero-center">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href={place.home}>{site.brand}</Link>
            <span aria-hidden="true">/</span><span aria-current="page">{tool.name}</span>
          </nav>
          <h1><mark>{tool.name}</mark> Converter</h1>
          <p className="lead">{tool.lead}</p>
          <UploadCard tool={tool} heading={heading} />
          <TrustRow local={local} />
        </div>
      </section>
      <Steps index="01" title={local ? "How to read a QR code online" : `How to convert ${tool.noun || tool.label} to a URL`} steps={howToSteps(tool)} />
      <About index="02" tool={tool} />
      <Features index="03" eyebrow="Features" title={`Why use this ${tool.name} tool`} cards={features} />
      <Faq index="04" faqs={faqs} title={`${tool.name}: frequently asked questions`} />
      <ToolGrid path={place.path} index="05" list={tools.filter((entry) => entry.slug !== tool.slug)} title="More free link tools" subtitle="Share other kinds of content the same way." />
    </div>
  );
}

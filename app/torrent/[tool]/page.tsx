import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TorrentTool from "../TorrentTool";
import BrowserTorrentTool from "../BrowserTorrentTool";
import TorrentCalculator from "../TorrentCalculator";
import { torrentTools, calculatorSlugs } from "../tools";

interface PageProps { params: Promise<{ tool: string }> }
// Every supported tool is prebuilt; unknown slugs must not create a server fallback.
export const dynamicParams = false;
export function generateStaticParams() {
  return torrentTools.map(({ slug }) => ({ tool: slug }));
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tool } = await params;
  const config = torrentTools.find(({ slug }) => slug === tool);
  if (!config) return {};
  return {
    title: `${config.name} | ToolsBase`,
    description: config.description,
    alternates: { canonical: `/torrent/${config.slug}` },
  };
}
export default async function Page({ params }: PageProps) {
  const { tool } = await params;
  const config = torrentTools.find(({ slug }) => slug === tool);
  if (!config) notFound();
  if (["browser-torrent-downloader", "torrent-to-direct-download", "torrent-health-checker"].includes(config.slug)) return <BrowserTorrentTool key={config.slug} slug={config.slug} />;
  if (calculatorSlugs.includes(config.slug)) return <TorrentCalculator key={config.slug} slug={config.slug} />;
  return <TorrentTool key={config.slug} slug={config.slug} />;
}

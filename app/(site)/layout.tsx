import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { searchTools } from "@/app/lib/tool-index";

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ToolsBase",
  alternateName: "ToolsBase",
  url: "https://toolsbase.org/",
};

// Main ToolsBase chrome. /share and /hls sit outside this route group and use their own layouts.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }} />
      <SiteHeader tools={searchTools()} />
      <main className="site-main">{children}</main>
      <SiteFooter />
    </>
  );
}

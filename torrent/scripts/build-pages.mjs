// Generates index.html, one <slug>/index.html per tool, 404.html, and sitemap.xml from assets/js/catalog.js.
// Run after editing the catalog or the shared page shell: node torrent/scripts/build-pages.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { site, torrentTools } from "../assets/js/catalog.js";

const root = new URL("../", import.meta.url);
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const year = new Date().getFullYear();

// Absolute path of the site root (e.g. /alltools/torrent/), for pages served at arbitrary URLs like 404.html.
const basePath = new URL(site.url).pathname;
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
const breadcrumb = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, item], index) => ({ "@type": "ListItem", position: index + 1, name, item })),
});

// PostHog's standard async loader, configured like toolsbase.org (app/provider.tsx).
// Tool panels carry ph-no-capture/ph-mask, so magnets, file names, and results are not captured or recorded.
const analytics = site.posthog?.key ? `<script>
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init(${JSON.stringify(site.posthog.key)}, { api_host: ${JSON.stringify(site.posthog.host)}, person_profiles: "identified_only", defaults: "2025-11-30" });
    posthog.register({ site: "torrent-tools" });
  </script>` : "";

function page({ title, description, canonical, base, body, tool, structuredData, robots }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}">
  ${robots ? `<meta name="robots" content="${robots}">` : `<link rel="canonical" href="${escape(canonical)}">`}
  ${site.googleSiteVerification ? `<meta name="google-site-verification" content="${escape(site.googleSiteVerification)}">` : ""}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ToolsBase">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:url" content="${escape(canonical)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escape(title)}">
  <meta name="twitter:description" content="${escape(description)}">
  ${structuredData ? jsonLd({ "@context": "https://schema.org", "@graph": structuredData }) : ""}
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📡</text></svg>">
  <link rel="stylesheet" href="${base}assets/css/torrent.css">
  ${analytics}
  ${tool ? `<script type="module" src="${base}assets/js/main.js"></script>` : ""}
</head>
<body>
  <header class="site-header">
    <div class="inner">
      <a class="brand" href="${site.parentUrl}">ToolsBase</a>
      <nav aria-label="Main navigation">
        <a href="${base}">Torrent tools</a>
        <a href="${site.parentUrl}#tool-directory">All tools</a>
        <a href="${site.parentUrl}about">About</a>
      </nav>
    </div>
  </header>
  <main class="site-main">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="${site.parentUrl}">Home</a><span aria-hidden="true">/</span><a href="${base}">Torrent &amp; Hashing</a>
    </nav>
${body}
    <aside class="terms-notice" aria-labelledby="torrent-terms-heading">
      <h2 id="torrent-terms-heading">Terms of use &amp; educational disclaimer</h2>
      <p>These tools are designed for lawful, educational, and open-source data management purposes. Use them only with content you own, content in the public domain, or content you have permission to access and share.</p>
      <p>Do not use these tools to infringe copyright or distribute unauthorized content. You are responsible for following applicable laws and content licenses. Tools and estimates are provided as is; they do not guarantee content safety, availability, or accuracy.</p>
    </aside>
  </main>
  <footer class="site-footer">
    <div class="inner">
      <div class="top">
        <div>
          <a class="brand" href="${site.parentUrl}">ToolsBase</a>
          <p>Simple tools for the things you do every day.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="${site.parentUrl}#tool-directory">All tools</a>
          <a href="${site.parentUrl}about">About</a>
          <a href="${site.parentUrl}contact">Contact</a>
          <a href="${site.parentUrl}privacy">Privacy policy</a>
        </nav>
      </div>
      <div class="bottom">
        <p>© ${year} ToolsBase. All rights reserved.</p>
        <p>Tools are provided “as is”, without warranties. No affiliation with third-party brands.</p>
      </div>
    </div>
  </footer>
</body>
</html>
`;
}

// Directory page
writeFileSync(new URL("index.html", root), page({
  title: `${site.name} | ToolsBase`,
  description: site.description,
  canonical: site.url,
  base: "./",
  structuredData: [
    {
      "@type": "CollectionPage", name: site.name, description: site.description, url: site.url,
      isPartOf: { "@type": "WebSite", name: "ToolsBase", url: site.parentUrl },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: torrentTools.map((tool, index) => ({ "@type": "ListItem", position: index + 1, name: tool.name, url: `${site.url}${tool.slug}/` })),
      },
    },
    breadcrumb([["ToolsBase", site.parentUrl], ["Torrent & Hashing", site.url]]),
  ],
  body: `    <header class="page-header">
      <span class="eyebrow">YOUR FILES. YOUR BROWSER.</span>
      <h1>Torrent &amp; Hashing Tools</h1>
      <p>Create, inspect, and share torrent metadata with free browser utilities. Calculate, inspect, or connect to compatible peers.</p>
    </header>
    <div class="catalog">
${torrentTools.map((tool) => `      <a class="catalog-card" href="./${tool.slug}/"><span aria-hidden="true">${tool.icon}</span><h2>${escape(tool.name)}</h2><p>${escape(tool.description)}</p><strong>Open tool →</strong></a>`).join("\n")}
    </div>
    <p class="note">Supports BitTorrent v1 metadata and the v1 portion of hybrid torrents. Metadata tools run locally. The browser downloader and health checker connect to peers only when you start them.</p>`,
}));

// Tool pages: static header for SEO and no-JS visitors; main.js mounts the tool into #tool-root.
for (const tool of torrentTools) {
  mkdirSync(new URL(`${tool.slug}/`, root), { recursive: true });
  writeFileSync(new URL(`${tool.slug}/index.html`, root), page({
    title: `${tool.name} | ToolsBase`,
    description: tool.description,
    canonical: `${site.url}${tool.slug}/`,
    base: "../",
    tool,
    structuredData: [
      {
        "@type": "WebApplication", name: tool.name, description: tool.description, url: `${site.url}${tool.slug}/`,
        applicationCategory: "UtilitiesApplication", operatingSystem: "Any (web browser)", browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        ...(tool.keywords ? { keywords: tool.keywords } : {}),
      },
      breadcrumb([["ToolsBase", site.parentUrl], ["Torrent & Hashing", site.url], [tool.name, `${site.url}${tool.slug}/`]]),
    ],
    body: `    <header class="page-header">
      <span class="eyebrow">TORRENT &amp; HASHING</span>
      <h1><span aria-hidden="true">${tool.icon}</span> ${escape(tool.name)}</h1>
      <p>${escape(tool.description)}</p>
    </header>
    <div id="tool-root" data-tool="${tool.slug}">
      <noscript><p class="error">This tool runs in your browser and needs JavaScript enabled.</p></noscript>
    </div>`,
  }));
}

// 404: GitHub Pages serves it for any missing URL, so asset/link paths must be absolute.
writeFileSync(new URL("404.html", root), page({
  title: "Page not found | ToolsBase",
  description: "This page does not exist.",
  canonical: site.url,
  base: basePath,
  robots: "noindex",
  body: `    <header class="page-header">
      <span class="eyebrow">404</span>
      <h1>Page not found</h1>
      <p>This tool or page does not exist. <a href="${basePath}" style="color:#2563eb">Browse all torrent &amp; hashing tools →</a></p>
    </header>`,
}));

const urls = [site.url, ...torrentTools.map((tool) => `${site.url}${tool.slug}/`)];
writeFileSync(new URL("sitemap.xml", root), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>
`);

console.log(`Generated index.html, ${torrentTools.length} tool pages, 404.html, and sitemap.xml`);

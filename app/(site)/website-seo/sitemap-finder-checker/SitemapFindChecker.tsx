"use client";
import React, { useState } from "react";
import { XMLParser } from "fast-xml-parser";
import FAQSection from "@/app/components/FAQSection";
import { websiteSEOFAQs } from "@/app/components/faqData";

type SitemapResult = {
  url: string;
  valid?: boolean;
  error?: string;
};

type Result = {
  sitemaps: SitemapResult[];
  found: boolean;
  error?: string;
};

async function fetchSitemapUrls(siteUrl: string): Promise<string[]> {
  const urls: string[] = [];
  // Try default /sitemap.xml
  try {
    const url = new URL("/sitemap.xml", siteUrl).toString();
    const res = await fetch(url, { method: "HEAD" });
    if (res.ok && res.headers.get("content-type")?.includes("xml")) {
      urls.push(url);
    }
  } catch {}
  // Try robots.txt for all Sitemap: entries
  try {
    const robotsUrl = new URL("/robots.txt", siteUrl).toString();
    const res = await fetch(robotsUrl);
    if (res.ok) {
      const text = await res.text();
      const matches = [...text.matchAll(/Sitemap:\s*(\S+)/gi)];
      for (const m of matches) {
        if (m[1] && !urls.includes(m[1])) urls.push(m[1]);
      }
    }
  } catch {}
  return urls;
}

async function checkSitemapValid(sitemapUrl: string): Promise<boolean> {
  try {
    const res = await fetch(sitemapUrl);
    if (!res.ok) return false;
    const text = await res.text();
    return /<\s*(urlset|sitemapindex)[^>]*>/i.test(text);
  } catch {
    return false;
  }
}

function normalizeUrl(url: string): string {
  if (!/^https?:\/\//i.test(url)) {
    return "https://" + url.replace(/^\/+/, "");
  }
  return url;
}

function extractLocLinks(xml: string): string[] {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      ignoreDeclaration: true,
      parseTagValue: true,
      trimValues: true,
    });
    const parsed = parser.parse(xml);

    // Handle both <urlset> and <sitemapindex>
    let urls: string[] = [];
    if (parsed.urlset && parsed.urlset.url) {
      const urlArr = Array.isArray(parsed.urlset.url)
        ? parsed.urlset.url
        : [parsed.urlset.url];
      urls = urlArr.map((u: any) => u.loc).filter(Boolean);
    } else if (parsed.sitemapindex && parsed.sitemapindex.sitemap) {
      const sitemapArr = Array.isArray(parsed.sitemapindex.sitemap)
        ? parsed.sitemapindex.sitemap
        : [parsed.sitemapindex.sitemap];
      urls = sitemapArr.map((s: any) => s.loc).filter(Boolean);
    }
    return urls;
  } catch {
    return [];
  }
}

function SitemapFindChecker() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);
  const [validating, setValidating] = useState<number | null>(null);
  const [sitemapLinks, setSitemapLinks] = useState<Record<string, string[]>>(
    {},
  );
  const [linksLoading, setLinksLoading] = useState<Record<string, boolean>>({});
  const [linksError, setLinksError] = useState<Record<string, string>>({});

  const handleCopy = async (url: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1200);
    } catch {}
  };

  const handleCopyAll = async (urls: string[]) => {
    try {
      await navigator.clipboard.writeText(urls.join("\n"));
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 1200);
    } catch {}
  };

  const handleValidate = async (idx: number) => {
    if (!result) return;
    setValidating(idx);
    const url = result.sitemaps[idx].url;
    setLinksLoading((prev) => ({ ...prev, [url]: true }));
    setLinksError((prev) => ({ ...prev, [url]: "" }));
    const valid = await checkSitemapValid(url);
    setResult((prev) =>
      prev
        ? {
            ...prev,
            sitemaps: prev.sitemaps.map((s, i) =>
              i === idx ? { ...s, valid } : s,
            ),
          }
        : prev,
    );
    if (valid) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch sitemap XML");
        const text = await res.text();
        const locs = extractLocLinks(text);
        setSitemapLinks((prev) => ({
          ...prev,
          [url]: locs,
        }));
        setLinksError((prev) => ({
          ...prev,
          [url]:
            locs.length === 0 ? "No <loc> links found in this sitemap." : "",
        }));
      } catch (e: any) {
        setSitemapLinks((prev) => ({
          ...prev,
          [url]: [],
        }));
        setLinksError((prev) => ({
          ...prev,
          [url]: "Failed to fetch or parse sitemap XML. (CORS/network error?)",
        }));
      }
    } else {
      setSitemapLinks((prev) => ({
        ...prev,
        [url]: [],
      }));
      setLinksError((prev) => ({
        ...prev,
        [url]: "Invalid sitemap XML.",
      }));
    }
    setLinksLoading((prev) => ({ ...prev, [url]: false }));
    setValidating(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    try {
      const siteUrl = normalizeUrl(input.trim());
      const sitemapUrls = await fetchSitemapUrls(siteUrl);
      if (!sitemapUrls.length) {
        setResult({ sitemaps: [], found: false });
        setLoading(false);
        return;
      }
      // Only fetch URLs, don't validate yet
      const sitemaps: SitemapResult[] = sitemapUrls.map((url) => ({ url }));
      setResult({ sitemaps, found: true });
    } catch (error: any) {
      setResult({
        sitemaps: [],
        found: false,
        error: error?.message || "Unknown error",
      });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-extrabold mb-1 text-blue-700 flex items-center gap-2">
          <span role="img" aria-label="map">
            🗺️
          </span>
          Sitemap Finder & Checker
        </h2>
        <p className="mb-5 text-gray-500 text-sm">
          Quickly find and validate sitemap URLs for any website. Enter a domain
          below and click <span className="font-semibold">Check</span>.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
          <input
            type="text"
            className="px-5 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 bg-gray-50 text-gray-900 placeholder-gray-400 text-base"
            placeholder="Enter website URL (e.g. example.com)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full border border-zinc-300 px-6 py-3 rounded-md text-sm font-medium
             hover:border-black
             disabled:opacity-50 disabled:cursor-not-allowed
             transition"
          >
            {loading ? "Checking…" : "Check"}
          </button>
        </form>
        {result && (
          <div className="border rounded-xl p-4 bg-gray-50 mt-4">
            {result.found && result.sitemaps.length > 0 ? (
              <>
                <div className="mb-3 font-semibold flex items-center gap-2">
                  Sitemaps found:
                  <button
                    onClick={() =>
                      handleCopyAll(result.sitemaps.map((s) => s.url))
                    }
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition flex items-center gap-1"
                    type="button"
                  >
                    <span role="img" aria-label="copy">
                      📋
                    </span>
                    {allCopied ? "All Copied!" : "Copy All"}
                  </button>
                </div>
                <ul className="space-y-3">
                  {result.sitemaps.map((s, idx) => (
                    <li
                      key={s.url}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200"
                    >
                      <div className="flex-1 break-all">
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline"
                        >
                          {s.url}
                        </a>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => handleCopy(s.url, idx)}
                          className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 flex items-center gap-1"
                          type="button"
                          title="Copy URL"
                        >
                          <span role="img" aria-label="copy">
                            📋
                          </span>
                          {copiedIdx === idx ? "Copied!" : "Copy"}
                        </button>
                        <button
                          onClick={() => handleValidate(idx)}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition font-semibold shadow-sm"
                          type="button"
                          disabled={validating === idx}
                        >
                          {validating === idx ? "Validating..." : "Validate"}
                        </button>
                        {typeof s.valid === "boolean" && (
                          <span
                            className={
                              s.valid
                                ? "text-green-700 font-semibold"
                                : "text-red-700 font-semibold"
                            }
                          >
                            {s.valid ? "Valid XML" : "Invalid XML"}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="text-red-700 font-semibold py-2">
                No sitemap found for this site.
              </div>
            )}
            {result.error && (
              <>
                <div className="border-t border-gray-200 my-3"></div>
                <div className="text-red-700 mt-1 font-semibold">
                  Error: {result.error}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {/* Show all sitemap links below the main card */}
      {result && result.found && result.sitemaps.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="font-semibold mb-2 text-blue-700">
            All Sitemap Links:
          </div>
          <ul className="list-disc pl-6 space-y-1">
            {result.sitemaps.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline break-all"
                >
                  {s.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Show extracted <loc> links for each validated sitemap */}
      {Object.entries(sitemapLinks).map(([url, links]) => (
        <div
          key={url}
          className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4"
        >
          <div className="font-semibold mb-2 text-green-700">
            Links in{" "}
            <a
              href={url}
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {url}
            </a>
            :
          </div>
          {linksLoading[url] ? (
            <div className="text-green-700">Loading links…</div>
          ) : linksError[url] ? (
            <div className="text-red-700">{linksError[url]}</div>
          ) : links.length > 0 ? (
            <ul className="list-decimal pl-6 space-y-1 text-sm break-all">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 underline"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">No links found.</div>
          )}
        </div>
      ))}
      <FAQSection faqs={websiteSEOFAQs} />
    </div>
  );
}

export default SitemapFindChecker;

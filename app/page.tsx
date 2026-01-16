"use client";

import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import { usePostHog } from "posthog-js/react";

const categories = [
  {
    name: "JSON & Data",
    icon: "🧩",
    tools: [
      {
        name: "JSON Formatter & Validator",
        slug: "json-formatter-validator",
        icon: "🧾",
      },
      { name: "JSON Minifier", slug: "json-minifier", icon: "📦" },
      { name: "JSON Pretty Printer", slug: "json-pretty-print", icon: "🖨️" },
      {
        name: "JSON Schema Validator",
        slug: "json-schema-validator",
        icon: "✅",
      },
      { name: "CSV to JSON Converter", slug: "csv-to-json", icon: "🔁" },
      { name: "JSON to CSV Converter", slug: "json-to-csv", icon: "🔁" },
      { name: "YAML to JSON Converter", slug: "yaml-to-json", icon: "📄" },
      { name: "JSON to YAML Converter", slug: "json-to-yaml", icon: "📄" },
      { name: "XML Formatter", slug: "xml-formatter", icon: "🧷" },
      { name: "XML to JSON Converter", slug: "xml-to-json", icon: "🔄" },
      { name: "INI to JSON Converter", slug: "ini-to-json", icon: "⚙️" },
      { name: "TOML to JSON Converter", slug: "toml-to-json", icon: "📚" },
      { name: "JSON Diff Viewer", slug: "json-diff", icon: "🆚" },
      { name: "JSON Path Tester", slug: "jsonpath-tester", icon: "🔍" },
      { name: "JSON Merge Tool", slug: "json-merge", icon: "🧬" },
    ],
  },
  {
    name: "Encoding & Decoding",
    icon: "🔐",
    tools: [
      { name: "Base64 Encoder", slug: "base64-encode", icon: "🧬" },
      { name: "Base64 Decoder", slug: "base64-decode", icon: "🧬" },
      { name: "URL Encoder", slug: "url-encode", icon: "🌐" },
      { name: "URL Decoder", slug: "url-decode", icon: "🌐" },
      { name: "HTML Entity Encoder", slug: "html-entity-encode", icon: "🔣" },
      { name: "HTML Entity Decoder", slug: "html-entity-decode", icon: "🔣" },
      { name: "JWT Decoder", slug: "jwt-decoder", icon: "🎫" },
      { name: "QR Code Generator", slug: "qr-code-generator", icon: "� QR" },
      { name: "Gzip String Compressor", slug: "gzip-compressor", icon: "🗜️" },
      {
        name: "Gzip String Decompressor",
        slug: "gzip-decompressor",
        icon: "🗜️",
      },
      { name: "Morse Code Encoder", slug: "morse-encode", icon: "📡" },
      { name: "Morse Code Decoder", slug: "morse-decode", icon: "📡" },
    ],
  },
  {
    name: "Time & Date",
    icon: "⏱️",
    tools: [
      { name: "Timestamp Converter", slug: "timestamp-converter", icon: "📅" },
      { name: "Current Unix Time", slug: "current-unix-time", icon: "⏰" },
      { name: "Timezone Converter", slug: "timezone-converter", icon: "🌍" },
      { name: "Cron Expression Parser", slug: "cron-parser", icon: "🧮" },
      { name: "Cron Expression Generator", slug: "cron-generator", icon: "🧩" },
      { name: "Date Difference Calculator", slug: "date-diff", icon: "➖" },
      { name: "ISO Date Formatter", slug: "iso-date-formatter", icon: "📆" },
      { name: "Countdown Generator", slug: "countdown-generator", icon: "⏳" },
      {
        name: "Working Days Calculator",
        slug: "working-days-calculator",
        icon: "📊",
      },
    ],
  },
  {
    name: "Text & Strings",
    icon: "✏️",
    tools: [
      { name: "Text Diff Checker", slug: "text-diff", icon: "🧮" },
      { name: "Case Converter", slug: "case-converter", icon: "🔡" },
      { name: "Slug Generator", slug: "slug-generator", icon: "🏷️" },
      { name: "Word Counter", slug: "word-counter", icon: "📏" },
      { name: "Character Counter", slug: "character-counter", icon: "📏" },
      {
        name: "Lorem Ipsum Generator",
        slug: "lorem-ipsum-generator",
        icon: "📜",
      },
      {
        name: "Duplicate Line Remover",
        slug: "duplicate-line-remover",
        icon: "🧹",
      },
      { name: "Line Sorter", slug: "line-sorter", icon: "↕️" },
      { name: "Whitespace Trimmer", slug: "whitespace-trimmer", icon: "✂️" },
      { name: "String Reverser", slug: "string-reverser", icon: "🔁" },
      { name: "Find & Replace Tool", slug: "find-replace", icon: "🔍" },
      { name: "URL Slug Cleaner", slug: "url-slug-cleaner", icon: "🧼" },
    ],
  },
  {
    name: "Images & Media",
    icon: "🖼️",
    tools: [
      { name: "Image Resizer", slug: "image-resizer", icon: "📏" },
      { name: "Image Compressor", slug: "image-compressor", icon: "🗜️" },
      { name: "PNG to JPG Converter", slug: "png-to-jpg", icon: "🖼️" },
      { name: "JPG to PNG Converter", slug: "jpg-to-png", icon: "🖼️" },
      { name: "SVG Optimizer", slug: "svg-optimizer", icon: "📐" },
      { name: "Favicon Generator", slug: "favicon-generator", icon: "🌟" },
      { name: "Image Cropper", slug: "image-cropper", icon: "✂️" },
      {
        name: "Image to Base64 Converter",
        slug: "image-to-base64",
        icon: "🧬",
      },
      {
        name: "Base64 to Image Converter",
        slug: "base64-to-image",
        icon: "🧬",
      },
      { name: "Video to GIF Converter", slug: "video-to-gif", icon: "🎞️" },
    ],
  },
  {
    name: "Networking",
    icon: "🌐",
    tools: [
      { name: "IP Address Lookup", slug: "ip-lookup", icon: "📍" },
      { name: "DNS Lookup", slug: "dns-lookup", icon: "📡" },
      { name: "WHOIS Lookup", slug: "whois-lookup", icon: "🪪" },
      { name: "Ping Tester", slug: "ping-tester", icon: "📶" },
      { name: "HTTP Header Viewer", slug: "http-header-viewer", icon: "📨" },
      { name: "URL Parser", slug: "url-parser", icon: "🧩" },
      { name: "CIDR Calculator", slug: "cidr-calculator", icon: "📏" },
      { name: "MAC Address Lookup", slug: "mac-lookup", icon: "💻" },
      { name: "User-Agent Parser", slug: "user-agent-parser", icon: "🔍" },
    ],
  },
  {
    name: "Security",
    icon: "🛡️",
    tools: [
      { name: "Password Generator", slug: "password-generator", icon: "🔑" },
      { name: "Hash Generator (MD5/SHA)", slug: "hash-generator", icon: "🧮" },
      { name: "Bcrypt Hash Generator", slug: "bcrypt-generator", icon: "🔐" },
      { name: "JWT Debugger", slug: "jwt-debugger", icon: "🧪" },
      { name: "HMAC Generator", slug: "hmac-generator", icon: "📏" },
      { name: "UUID Generator", slug: "uuid-generator", icon: "🎲" },
      { name: "PEM to JWK Converter", slug: "pem-to-jwk", icon: "🧷" },
      { name: "CSR Decoder", slug: "csr-decoder", icon: "📜" },
      { name: "Certificate Decoder", slug: "certificate-decoder", icon: "📄" },
    ],
  },
  {
    name: "Math & Numbers",
    icon: "➗",
    tools: [
      {
        name: "Percentage Calculator",
        slug: "percentage-calculator",
        icon: "📊",
      },
      { name: "Unit Converter", slug: "unit-converter", icon: "⚖️" },
      { name: "Number Base Converter", slug: "base-converter", icon: "🔢" },
      {
        name: "Random Number Generator",
        slug: "random-number-generator",
        icon: "🎲",
      },
      { name: "Simple Calculator", slug: "simple-calculator", icon: "🧮" },
      { name: "Loan Calculator", slug: "loan-calculator", icon: "🏦" },
      {
        name: "Compound Interest Calculator",
        slug: "compound-interest-calculator",
        icon: "📈",
      },
      {
        name: "Statistics Calculator",
        slug: "statistics-calculator",
        icon: "📉",
      },
      { name: "Matrix Calculator", slug: "matrix-calculator", icon: "🧊" },
    ],
  },
  {
    name: "Colors & Design",
    icon: "🎨",
    tools: [
      { name: "Color Picker", slug: "color-picker", icon: "🎯" },
      { name: "Palette Generator", slug: "palette-generator", icon: "🌈" },
      { name: "Gradient Generator", slug: "gradient-generator", icon: "📶" },
      { name: "Contrast Checker", slug: "contrast-checker", icon: "🌓" },
      {
        name: "Box Shadow Generator",
        slug: "box-shadow-generator",
        icon: "📦",
      },
      {
        name: "Border Radius Generator",
        slug: "border-radius-generator",
        icon: "⭕",
      },
      {
        name: "CSS Clip-Path Generator",
        slug: "clip-path-generator",
        icon: "✂️",
      },
      {
        name: "Tailwind Color Explorer",
        slug: "tailwind-color-explorer",
        icon: "💠",
      },
      { name: "SVG Icon Previewer", slug: "svg-icon-previewer", icon: "🔍" },
    ],
  },
  {
    name: "Generators",
    icon: "⚙️",
    tools: [
      { name: "UUID Generator", slug: "uuid-generator-2", icon: "🎲" },
      { name: "NanoID Generator", slug: "nanoid-generator", icon: "🧬" },
      { name: "Fake Data Generator", slug: "fake-data-generator", icon: "🧪" },
      { name: "Sitemap Generator", slug: "sitemap-generator", icon: "🗺️" },
      {
        name: "robots.txt Generator",
        slug: "robots-txt-generator",
        icon: "🤖",
      },
      {
        name: "OpenAPI Stub Generator",
        slug: "openapi-stub-generator",
        icon: "📘",
      },
      { name: "README Generator", slug: "readme-generator", icon: "📖" },
      { name: "Changelog Generator", slug: "changelog-generator", icon: "📑" },
      { name: "Env File Generator", slug: "env-file-generator", icon: "📂" },
      {
        name: "SQL Insert Generator",
        slug: "sql-insert-generator",
        icon: "🗄️",
      },
    ],
  },
];

export default function Home() {
  const posthog = usePostHog();
  const [searchTerm, setSearchTerm] = useState("");

  // Flatten all tools for search
  const allTools = useMemo(() => {
    return categories.flatMap(category =>
      category.tools.map(tool => ({
        ...tool,
        category: category.name,
        categoryIcon: category.icon
      }))
    );
  }, []);

  // Initialize Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(allTools, {
      keys: ['name', 'category'],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true
    });
  }, [allTools]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }

    const results = fuse.search(searchTerm);
    return results.map(result => result.item);
  }, [searchTerm, fuse]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Capture search term in PostHog
    if (value.trim()) {
      posthog.capture('tool_search', {
        search_term: value,
        search_length: value.length,
        has_results: searchResults.length > 0
      });
    }
  };

  return (
    <div className="bg-zinc-50 font-sans dark:bg-black">
      <section className="mb-12">
        <h1 className="text-4xl font-semibold mb-3">
          Simple tools. Zero clutter.
        </h1>
        <p className="text-muted mb-6">
          Fast, free online utilities for developers & creators.
        </p>

        <input
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search a tool..."
          className="w-full bg-card border border-border px-4 py-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </section>

      {/* Search Results */}
      {searchTerm.trim() && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Search Results {searchResults.length > 0 && `(${searchResults.length})`}
          </h2>

          {searchResults.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {searchResults.map((tool) => (
                <a
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="border border-border bg-card p-4 rounded-md hover:border-white transition"
                >
                  <div className="flex items-center mb-2">
                    <span className="mr-2 text-sm text-muted">
                      {tool.categoryIcon} {tool.category}
                    </span>
                  </div>
                  <h3 className="font-medium flex items-center">
                    <span className="mr-2">{tool.icon}</span>
                    {tool.name}
                  </h3>
                  <p className="text-sm text-muted mt-1">Open tool →</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted">No tools found matching "{searchTerm}"</p>
              <p className="text-sm text-muted mt-2">Try a different search term</p>
            </div>
          )}
        </section>
      )}

      {/* All Categories */}
      {(!searchTerm.trim() || searchResults.length === 0) && (
        <section className="space-y-10">
          {categories.map((category) => (
            <div key={category.name}>
              <div className="flex items-center mb-3">
                <span className="mr-2 text-xl">{category.icon}</span>
                <h2 className="text-2xl font-semibold">{category.name}</h2>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {category.tools.map((tool) => (
                  <a
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="border border-border bg-card p-4 rounded-md hover:border-white transition"
                  >
                    <h3 className="font-medium flex items-center">
                      <span className="mr-2">{tool.icon}</span>
                      {tool.name}
                    </h3>
                    <p className="text-sm text-muted mt-1">Open tool →</p>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

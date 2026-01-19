import { NextResponse } from "next/server";
import { parseHTML } from "linkedom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";

export const runtime = "nodejs"; // IMPORTANT

function normalizeUrl(input: string) {
  let url = input.trim();

  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  // Validate final URL
  new URL(url);

  return url;
}

export async function POST(req: Request) {
  try {
    let { url } = await req.json();
    console.log("url", url);

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    try {
      url = normalizeUrl(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 },
      );
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AllToolsBot/1.0)",
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch webpage");
    }

    const html = await res.text();

    // ✅ ESM-safe DOM parsing
    const { document } = parseHTML(html);

    const reader = new Readability(document);
    const article = reader.parse();

    if (!article?.content) {
      throw new Error("Unable to extract readable content");
    }

    const turndown = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });

    const markdown = turndown.turndown(article.content);
    console.log("markdown", markdown);

    return NextResponse.json({ markdown });
  } catch (err: any) {
    console.log("err", err);
    return NextResponse.json(
      { error: err.message || "Conversion failed" },
      { status: 500 },
    );
  }
}

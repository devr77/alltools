import { ConversionError, fetchPublicHtml, htmlToMarkdown } from "../../lib/webpage-markdown";

export const runtime = "edge";

export async function POST(request: Request) {
  let input: unknown;
  try { input = await request.json(); } catch {
    return Response.json({ error: "Send a JSON object containing a URL." }, { status: 400 });
  }
  try {
    const url = input && typeof input === "object" && "url" in input ? input.url : undefined;
    const page = await fetchPublicHtml(url);
    return Response.json({ markdown: htmlToMarkdown(page.html, page.url) });
  } catch (error) {
    if (error instanceof ConversionError) return Response.json({ error: error.message }, { status: error.status });
    const timeout = error instanceof Error && ["AbortError", "TimeoutError"].includes(error.name);
    return Response.json({ error: timeout ? "The website took too long to respond. Please try again." : "Could not retrieve this webpage. Check the URL and try another public page." }, { status: timeout ? 504 : 502 });
  }
}

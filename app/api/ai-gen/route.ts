export const runtime = "edge";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Send valid JSON containing a prompt." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Send a JSON object containing a prompt." }, { status: 400 });
  }
  const { prompt, masterprompt } = body as { prompt?: unknown; masterprompt?: unknown };
  if (typeof prompt !== "string" || !prompt.trim()) {
    return Response.json({ error: "Prompt is required." }, { status: 400 });
  }
  if (prompt.length > 12000) {
    return Response.json({ error: "Keep the prompt under 12,000 characters." }, { status: 400 });
  }
  if (masterprompt !== undefined && (typeof masterprompt !== "string" || masterprompt.length > 4000)) {
    return Response.json({ error: "The system prompt must be text under 4,000 characters." }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY?.trim() || process.env.NEXT_GROQ_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { error: "AI generation is not configured. Set GROQ_API_KEY (or NEXT_GROQ_KEY) on the server." },
      { status: 503 },
    );
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model: process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: (typeof masterprompt === "string" && masterprompt.trim()) ||
              "You are a helpful assistant that provides concise and accurate information.",
          },
          { role: "user", content: prompt.trim() },
        ],
        max_completion_tokens: 2048,
        temperature: 0.7,
      }),
    });
    // Providers and proxies can return non-JSON errors. Keep our response JSON.
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (data?.error?.code === "model_not_found" || data?.error?.code === "model_decommissioned") {
        return Response.json({ error: "The configured AI model is unavailable. Set GROQ_MODEL to a chat model available to your Groq account." }, { status: 503 });
      }
      if (res.status === 401 || res.status === 403) {
        return Response.json({ error: "Groq rejected the server credentials or access permissions. Check the server API key and model access." }, { status: 503 });
      }
      if (res.status === 429) {
        return Response.json({ error: "The AI service has reached its usage limit. Please try again later." }, { status: 429 });
      }
      return Response.json({ error: "The AI service could not complete this request. Please try again." }, { status: 502 });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      return Response.json({ error: "The AI service returned an empty response. Please try again." }, { status: 502 });
    }
    return Response.json({ content: content.trim() });
  } catch (error) {
    const timeout = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name);
    return Response.json(
      {
        error: timeout
          ? "The AI service took too long to respond. Please try again."
          : "Could not connect to the AI service. Please try again.",
      },
      { status: timeout ? 504 : 502 },
    );
  }
}

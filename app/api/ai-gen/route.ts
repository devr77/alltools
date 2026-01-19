export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_GROQ_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Missing GROQ_API_KEY in environment." },
      { status: 500 },
    );
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant that generates concise, polite, and context-aware replies.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 256,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    return Response.json(
      { error: `Groq API error: ${res.status}` },
      { status: res.status },
    );
  }

  const data = await res.json();

  const content =
    data.choices?.[0]?.message?.content?.trim() ?? "No reply generated.";

  return Response.json({ content });
}

import AireplyGen from "./AireplyGen";

export async function onGenerate(prompt: string): Promise<string> {
  "use server";
  if (!prompt) return "";
  const apiKey = process.env.NEXT_GROQ_KEY;
  if (!apiKey) return "Missing GROQ_API_KEY in environment.";
  console.log("prompt", prompt);

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
    cache: "no-store",
  });

  if (!res.ok) {
    return `Groq API error: ${res.status}`;
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "No reply generated.";
}

export default function Page() {
  return <AireplyGen onGenerate={onGenerate} />;
}

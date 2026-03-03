import { getRuntimeConfig } from "@/lib/runtimeConfig";

type GeminiOptions = {
  model?: string;
  prompt: string;
};

export async function generateGeminiText({ model, prompt }: GeminiOptions) {
  const runtime = getRuntimeConfig();
  const geminiApiKey = runtime.geminiApiKey;
  const defaultModel = runtime.geminiModel || "gemini-2.0-flash";

  if (!geminiApiKey) {
    throw new Error("Missing Gemini API key. Open API Settings.");
  }

  const targetModel = model ?? defaultModel;
  const modelName = targetModel.startsWith("models/")
    ? targetModel
    : `models/${targetModel}`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!output) {
    throw new Error("Gemini returned no content");
  }
  return output as string;
}

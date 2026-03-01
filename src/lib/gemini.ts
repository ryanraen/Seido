type GeminiOptions = {
  model?: string;
  prompt: string;
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const DEFAULT_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash";

export async function generateGeminiText({ model, prompt }: GeminiOptions) {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing VITE_GEMINI_API_KEY");
  }

  const targetModel = model ?? DEFAULT_MODEL;
  const modelName = targetModel.startsWith("models/")
    ? targetModel
    : `models/${targetModel}`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
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

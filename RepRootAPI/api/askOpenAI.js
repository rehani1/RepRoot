import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userText, context = "" } = req.body || {};
  if (!userText) {
    return res.status(400).json({ error: "Missing userText" });
  }

  try {
    const messages = [
      {
        role: "system",
        content:
          "You are an assistant for the mobile app RepRoot which helps users track gym progress, workouts and nutrition."
      },
      context && { role: "system", content: context },
      { role: "user", content: userText }
    ].filter(Boolean);

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages,
      temperature: 0.8,
      max_tokens: 700
    });

    const assistantReply =
      completion.choices[0].message?.content?.trim() ?? "(no answer)";

    return res.status(200).json({ output: assistantReply });
  } catch (err) {
    const status = err?.response?.status ?? 500;
    const errorMsg =
      err?.response?.data?.error?.message ||
      err?.response?.data ||
      err.message ||
      "Unknown error";
    console.error("OpenAI /api error:", errorMsg);
    return res.status(status).json({ error: errorMsg });
  }
}

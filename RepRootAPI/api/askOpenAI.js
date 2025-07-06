import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userText, context = "" } = req.body;
  if (!userText) return res.status(400).json({ error: "Missing userText" });

  try {
    const completion = await openai.responses.create({
      model: "gpt-4.1-nano",
      input: userText,
      instructions:
        "You are an assistant for the mobile app RepRoot which helps users track gym progress, workouts and nutrition.",
      temperature: 1,
      max_output_tokens: 2048
    });

    res.status(200).json({ output: completion.output_text.trim() });
  } catch (err) {
    const status = err?.response?.status ?? 500;
    res.status(status).json({ error: err?.response?.data ?? err.message });
  }
}

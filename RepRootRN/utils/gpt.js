// RepRootRN/utils/gpt.js   (✨ new version – no OpenAI SDK here)
import { addAssistantMessage } from "./conversation";

const ENDPOINT = "https://rep-root.vercel.app/api/askOpenAI";  // ← change to yours

export async function chatRequest(userText) {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userText })
    });

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? `HTTP ${res.status}`);
    }

    const { output } = await res.json();
    addAssistantMessage(output);
  } catch (err) {
    console.error("AI error:", err);
    addAssistantMessage("I couldn’t reach the AI service. Please try again later.");
  }
}

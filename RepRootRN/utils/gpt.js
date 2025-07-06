
import { addAssistantMessage } from "./conversation";

const ENDPOINT = "https://rep-root.vercel.app/api/askOpenAI";

export async function chatRequest(userText, context = "") {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userText, context }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error ?? `HTTP ${res.status}`);
    }

    addAssistantMessage(data.output);
  } catch (err) {
    console.error("AI error:", err);
    addAssistantMessage(
      "I couldn’t reach the AI service. Please try again later."
    );
  }
}

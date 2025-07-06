// RepRootRN/utils/gpt.js
import { addAssistantMessage } from "./conversation";

const ENDPOINT = "https://rep-root.vercel.app/api/askOpenAI";

export async function chatRequest(userText, context = "") {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userText, context }),
    });

    /* ─────── QUICK PEEK (remove when happy) ─────── */
    const rawBody = await res.text();               // grab as plain text first
    // Uncomment the next line if you want to log *every* response
    // console.log("⇦ backend raw:", rawBody);
    /* ────────────────────────────────────────────── */

    if (!res.ok) {
      console.error("⇦ backend error:", rawBody);
      throw new Error(`HTTP ${res.status}`);
    }

    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      console.error("⇦ not JSON:", rawBody);
      throw new Error("Invalid JSON from server");
    }

    const { output } = data;
    addAssistantMessage(output);
  } catch (err) {
    console.error("AI error:", err);
    addAssistantMessage(
      "I couldn’t reach the AI service. Please try again later."
    );
  }
}

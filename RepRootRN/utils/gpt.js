import OpenAI from "openai";
import { addAssistantMessage, getConversation } from "./conversation";

const openai = new OpenAI({
  apiKey: "",
  dangerouslyAllowBrowser: true,
});

export async function chatRequest(userText) {  
    try {
      const res = await openai.responses.create({
        model: "gpt-4.1-nano",
        input: userText,
        instructions:
          "You are an assistant for the mobile app RepRoot which helps users track gym progress, workouts and nutrition.",
        temperature: 1,
        max_output_tokens: 2048
      });
  
      addAssistantMessage(res.output_text.trim());
    } catch (err) {                               
      if (err?.response) {
        console.error("Status:", err.response.status);
        console.error("Data:",   err.response.data);
      } else {
        console.error("Error:", err.message ?? err);
      }
  
      addAssistantMessage(
        "I couldn’t reach the AI service. Please try again later."
      );
    }
  }
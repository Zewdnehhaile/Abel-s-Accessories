
import { GoogleGenAI } from "@google/genai";

// Fix: Always create a new GoogleGenAI instance inside the function to ensure it uses the most up-to-date API key.
export const sendMessageToGemini = async (message: string): Promise<string> => {
  // Fix: Direct use of process.env.API_KEY as per the guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  try {
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model: model,
      // Fix: Simplifed contents to just the message string.
      contents: message,
      config: {
        systemInstruction: "Your name is AB. You are the AI assistant for 'Abel Accessories Sales'. You help customers with mobile accessory questions and repair inquiries. Be polite and concise. IMPORTANT: If asked for contact info, phone number, telegram, tiktok, or how to reach Abel, you MUST reply with EXACTLY this string: '0921275611/0910531611 or telegram @abel_ab19,tik tok @babi_abel_19'. If asked for the address, location, or where the shop is, reply with EXACTLY: 'bambu wha,dessie ,ethiopia'. Do not add any extra greeting or text to those specific responses."
      }
    });

    // Fix: Access the .text property directly as it is a getter, not a method.
    return response.text || "I didn't catch that. Could you say it again?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the brain. Please try again later.";
  }
};

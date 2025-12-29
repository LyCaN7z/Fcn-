
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

export const getFinancialInsights = async (transactions: Transaction[]) => {
  // Always initialize right before use as per guidelines to ensure up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  if (!process.env.API_KEY) return "AI insights unavailable (Missing API Key).";
  
  const summary = transactions.reduce((acc, t) => {
    const amt = t.type === 'income' ? t.amount : -t.amount;
    acc.balance += amt;
    return acc;
  }, { balance: 0 });

  const prompt = `Analyze this PUBG Clan Ledger. Balance: ${summary.balance} MMK. Provide 3 tactical gamer-style insights.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No insights found.";
  } catch (error) {
    console.error("Financial Insights Error:", error);
    return "Error scanning tactical data.";
  }
};

export const scanScrimResult = async (imageBase64: string) => {
  // Always initialize right before use as per guidelines to ensure up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const prompt = `
    Analyze this PUBG Scrim/Tournament result screenshot. 
    1. Identify the rank (1st, 2nd, etc).
    2. Estimate total kills if visible.
    3. Suggest a logical 'Prize Amount' in MMK based on standard 1st=50000, 2nd=30000, 3rd=10000.
    4. Provide a brief note summarizing the performance.
  `;

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: "image/jpeg",
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        // Using responseSchema for robust structured data extraction
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rank: {
              type: Type.STRING,
              description: 'The placement/rank achieved in the match.',
            },
            kills: {
              type: Type.NUMBER,
              description: 'Total estimated kills.',
            },
            estimatedPrize: {
              type: Type.NUMBER,
              description: 'Suggested prize amount in MMK.',
            },
            note: {
              type: Type.STRING,
              description: 'A brief summary of match performance.',
            },
          },
          required: ["rank", "kills", "estimatedPrize", "note"],
          propertyOrdering: ["rank", "kills", "estimatedPrize", "note"],
        },
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Scanner Error:", error);
    throw error;
  }
};


import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  // Handle POST requests only
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "অনুসন্ধানের বিষয় (Query) প্রয়োজন।" });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing in server environment variables.");
      return res.status(500).json({ error: "সার্ভার কনফিগারেশনে সমস্যা: API Key পাওয়া যায়নি। ভিercel সেটিংস চেক করুন।" });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `
      আপনি বাংলাদেশের একজন প্রধান রাজকীয় ইতিহাসবিদ এবং এনসাইক্লোপিডিয়া বিশেষজ্ঞ। 
      আপনার লক্ষ্য হলো ব্যবহারকারীকে বাংলাদেশের যেকোনো বিষয় সম্পর্কে অত্যন্ত নিখুঁত এবং আকর্ষণীয় তথ্য প্রদান করা।
      উত্তরটি অবশ্যই মার্জিত এবং উচ্চমানের বাংলা ভাষায় হতে হবে।
      Markdown ব্যবহার করে সুন্দরভাবে সাজিয়ে লিখুন।
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `বাংলাদেশ সম্পর্কে বিস্তারিত তথ্য দাও: ${query}` }] }],
      config: { 
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const text = response.text || "কোনো তথ্য পাওয়া যায়নি।";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Source",
      uri: chunk.web?.uri || "#"
    })).filter((s: any) => s.uri !== "#") || [];

    return res.status(200).json({ text, sources });

  } catch (error: any) {
    console.error("Gemini Server Error:", error);
    return res.status(500).json({ 
      error: `Gemini API এরর: ${error.message || "Internal Server Error"}` 
    });
  }
}

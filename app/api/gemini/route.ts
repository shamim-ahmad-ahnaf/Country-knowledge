
import { GoogleGenAI } from "@google/genai";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), { status: 400 });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing in server environment variables.");
      return new Response(JSON.stringify({ error: "Server configuration error: API Key missing." }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `
      আপনি বাংলাদেশের একজন প্রধান রাজকীয় ইতিহাসবিদ এবং এনসাইক্লোপিডিয়া বিশেষজ্ঞ। 
      আপনার লক্ষ্য হলো ব্যবহারকারীকে বাংলাদেশের যেকোনো বিষয় সম্পর্কে অত্যন্ত নিখুঁত এবং আকর্ষণীয় তথ্য প্রদান করা।
      উত্তরটি অবশ্যই মার্জিত এবং উচ্চমানের বাংলা ভাষায় হতে হবে।
      Markdown ব্যবহার করে সুন্দরভাবে সাজিয়ে লিখুন।
    `;

    // We use generateContent here for a simpler JSON response as requested, 
    // but the SDK is initialized on the server.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `বাংলাদেশ সম্পর্কে বিস্তারিত তথ্য দাও: ${query}` }] }],
      config: { 
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const text = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Source",
      uri: chunk.web?.uri || "#"
    })).filter((s: any) => s.uri !== "#") || [];

    return new Response(JSON.stringify({ text, sources }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal Server Error" 
    }), { status: 500 });
  }
}

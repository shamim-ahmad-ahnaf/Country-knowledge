
import { GoogleGenAI } from "@google/genai";
import { SearchResult, GroundingSource } from "../types";

/**
 * Service to interact with Gemini API for streaming encyclopedia information.
 */
export const streamBangladeshInfo = async (
  query: string, 
  onChunk: (text: string) => void,
  onComplete: (result: SearchResult) => void
) => {
  // Get the API key from process.env
  // Note: Vercel injects this during build or runtime
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("Critical: API_KEY is missing in process.env");
    throw new Error("API Key পাওয়া যায়নি। দয়া করে Vercel Settings-এ 'API_KEY' যোগ করে প্রজেক্টটি 'Redeploy' করুন।");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `
      আপনি বাংলাদেশের একজন প্রধান রাজকীয় ইতিহাসবিদ এবং এনসাইক্লোপিডিয়া বিশেষজ্ঞ। 
      আপনার লক্ষ্য হলো ব্যবহারকারীকে বাংলাদেশের যেকোনো বিষয় সম্পর্কে অত্যন্ত নিখুঁত, আধুনিক এবং আকর্ষণীয় তথ্য প্রদান করা।
      উত্তরটি অবশ্যই মার্জিত এবং উচ্চমানের বাংলা ভাষায় হতে হবে।
      Markdown ব্যবহার করে সুন্দরভাবে সাজিয়ে লিখুন।
      প্রয়োজনে Google Search ব্যবহার করে একদম লেটেস্ট তথ্য দিন।
    `;

    const streamResponse = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `বাংলাদেশ সম্পর্কে বিস্তারিত এবং সঠিক তথ্য দাও: ${query}` }] }],
      config: { 
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.1, // High precision for facts
      },
    });

    let fullText = "";
    const groundingSources: GroundingSource[] = [];

    for await (const chunk of streamResponse) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(fullText);
      }

      // Collect URLs from groundingChunks to show citations
      const metadata = chunk.candidates?.[0]?.groundingMetadata;
      if (metadata?.groundingChunks) {
        metadata.groundingChunks.forEach((c: any) => {
          if (c.web?.uri && c.web?.title) {
            if (!groundingSources.find(s => s.uri === c.web.uri)) {
              groundingSources.push({ 
                title: c.web.title, 
                uri: c.web.uri 
              });
            }
          }
        });
      }
    }

    if (!fullText) {
      throw new Error("মডেল থেকে কোনো তথ্য পাওয়া যায়নি।");
    }

    onComplete({
      text: fullText,
      sources: groundingSources,
      imageUrl: undefined
    });

  } catch (error: any) {
    console.error("Gemini API detailed error:", error);
    
    const errorMsg = error.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("QUOTA")) {
      throw new Error("দুঃখিত, বর্তমানে ফ্রি কোটা শেষ হয়ে গেছে। দয়া করে ১ মিনিট পর আবার চেষ্টা করুন।");
    } else if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("403") || errorMsg.includes("not found")) {
      throw new Error("আপনার এপিআই কি (API Key) সঠিক নয় অথবা ভারসেল সেটিংস থেকে লোড হচ্ছে না। 'Redeploy' করেছেন কি না নিশ্চিত করুন।");
    }
    
    throw new Error(`সার্চ করার সময় সমস্যা হয়েছে: ${error.message || "Unknown error"}`);
  }
};

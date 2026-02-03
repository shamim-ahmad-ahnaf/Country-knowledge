
import { GoogleGenAI } from "@google/genai";
import { SearchResult, GroundingSource } from "../types";

/**
 * Service to interact with Gemini API for streaming encyclopedia information.
 * Focused only on text to save quota and ensure reliability.
 */
export const streamBangladeshInfo = async (
  query: string, 
  onChunk: (text: string) => void,
  onComplete: (result: SearchResult) => void
) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key পাওয়া যায়নি। অনুগ্রহ করে ভারসেল এনভায়রনমেন্ট ভেরিয়েবল চেক করুন।");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    আপনি বাংলাদেশের একজন প্রধান রাজকীয় ইতিহাসবিদ এবং এনসাইক্লোপিডিয়া বিশেষজ্ঞ। 
    আপনার লক্ষ্য হলো ব্যবহারকারীকে বাংলাদেশের যেকোনো বিষয় সম্পর্কে অত্যন্ত নিখুঁত এবং ঐতিহাসিক তথ্য প্রদান করা।
    উত্তরটি অবশ্যই মার্জিত এবং উচ্চমানের বাংলা ভাষায় হতে হবে।
    
    নির্দেশনা:
    ১. উত্তরটি আকর্ষণীয় ঐতিহাসিক ভূমিকা দিয়ে শুরু করুন।
    ২. স্পষ্ট হেডিং (Markdown ##) ব্যবহার করুন।
    ৩. গুরুত্বপূর্ণ তথ্যগুলো বুলেট পয়েন্টে দেখান।
    ৪. একটি "একনজরে মূল তথ্য" সেকশন যুক্ত করুন।
  `;

  try {
    const streamResponse = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `বাংলাদেশ সম্পর্কে বিস্তারিত তথ্য দাও: ${query}` }] }],
      config: { 
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    let fullText = "";
    const groundingSources: GroundingSource[] = [];

    for await (const chunk of streamResponse) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(fullText);
      }

      const metadata = chunk.candidates?.[0]?.groundingMetadata;
      if (metadata?.groundingChunks) {
        metadata.groundingChunks.forEach((c: any) => {
          if (c.web?.uri && c.web?.title) {
            if (!groundingSources.find(s => s.uri === c.web.uri)) {
              groundingSources.push({ title: c.web.title, uri: c.web.uri });
            }
          }
        });
      }
    }

    if (!fullText) {
      throw new Error("সার্ভার থেকে কোনো তথ্য পাওয়া যায়নি।");
    }

    onComplete({
      text: fullText,
      sources: groundingSources,
      imageUrl: undefined // Images disabled to prioritize search success
    });

  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    
    if (error.message?.includes("429") || error.message?.includes("QUOTA")) {
      throw new Error("সার্ভার কোটা শেষ হয়েছে। অনুগ্রহ করে ১ মিনিট পর চেষ্টা করুন।");
    }
    
    throw new Error(error.message || "সার্চ করার সময় একটি সমস্যা হয়েছে।");
  }
};

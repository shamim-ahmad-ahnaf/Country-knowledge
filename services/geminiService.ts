
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
  // 1. Get the API Key from process.env
  const apiKey = process.env.API_KEY;
  
  // Debug check for the user (only in console)
  if (!apiKey) {
    console.error("DEBUG: API_KEY is missing in process.env");
    throw new Error("API Key পাওয়া যায়নি। দয়া করে Vercel-এর Project Settings-এ 'API_KEY' ভেরিয়েবলটি যোগ করেছেন কি না তা নিশ্চিত করুন।");
  }

  try {
    // 2. Initialize the AI client
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `
      আপনি বাংলাদেশের একজন প্রধান রাজকীয় ইতিহাসবিদ এবং এনসাইক্লোপিডিয়া বিশেষজ্ঞ। 
      আপনার লক্ষ্য হলো ব্যবহারকারীকে বাংলাদেশের যেকোনো বিষয় সম্পর্কে অত্যন্ত নিখুঁত এবং আকর্ষণীয় তথ্য প্রদান করা।
      উত্তরটি অবশ্যই মার্জিত এবং উচ্চমানের বাংলা ভাষায় হতে হবে।
      Markdown ব্যবহার করে সুন্দরভাবে সাজিয়ে লিখুন।
    `;

    // 3. Call the model using gemini-3-flash-preview for speed and efficiency
    const streamResponse = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `বাংলাদেশ সম্পর্কে বিস্তারিত তথ্য দাও: ${query}` }] }],
      config: { 
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.2, // Fact-focused
      },
    });

    let fullText = "";
    const groundingSources: GroundingSource[] = [];

    // 4. Process the stream
    for await (const chunk of streamResponse) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(fullText);
      }

      // Collect sources if available
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
      throw new Error("মডেল থেকে কোনো টেক্সট পাওয়া যায়নি। সম্ভবত কন্টেন্ট ফিল্টার করা হয়েছে।");
    }

    onComplete({
      text: fullText,
      sources: groundingSources,
      imageUrl: undefined
    });

  } catch (error: any) {
    console.error("Gemini API Full Error:", error);
    
    // Provide user-friendly descriptive errors
    const errorMsg = error.message || "";
    
    if (errorMsg.includes("429") || errorMsg.includes("QUOTA")) {
      throw new Error("দুঃখিত, বর্তমানে ফ্রি কোটা শেষ হয়ে গেছে। দয়া করে ১ মিনিট পর আবার চেষ্টা করুন।");
    } else if (errorMsg.includes("403") || errorMsg.includes("API_KEY_INVALID")) {
      throw new Error("আপনার API Key-টি সঠিক নয়। দয়া করে সেটি চেক করুন।");
    } else if (errorMsg.includes("404")) {
      throw new Error("সার্ভারের সাথে সংযোগ স্থাপন করা যাচ্ছে না। (404 Error)");
    }
    
    throw new Error(`সার্চ করার সময় একটি সমস্যা হয়েছে: ${error.message || "Unknown error"}`);
  }
};

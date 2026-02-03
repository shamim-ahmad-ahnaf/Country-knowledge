
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
  // Always create a fresh instance to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    আপনি বাংলাদেশের একজন প্রধান রাজকীয় ইতিহাসবিদ এবং ডিজিটাল এনসাইক্লোপিডিয়া বিশেষজ্ঞ। 
    আপনার লক্ষ্য হলো ব্যবহারকারীকে বাংলাদেশের যেকোনো বিষয় সম্পর্কে অত্যন্ত নিখুঁত, ঐতিহাসিক এবং আকর্ষণীয় তথ্য প্রদান করা।
    উত্তরটি অবশ্যই মার্জিত এবং উচ্চমানের বাংলা ভাষায় হতে হবে।
  `;

  try {
    // 1. First, Stream Text Content (Prioritize text to show information quickly)
    // Using gemini-3-flash-preview as it has the best balance of performance and limits
    const streamResponse = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `বাংলাদেশ সম্পর্কে বিস্তারিত এবং নির্ভুল এনসাইক্লোপিডিয়া তথ্য দাও: ${query}` }] }],
      config: { 
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.3, // Lower for more factual consistency
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

    // 2. Second, try to fetch image sequentially to avoid 429 Rate Limits on free tiers
    let generatedImageUrl = undefined;
    try {
      const imageResult = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [{ text: `A professional photograph of ${query} in Bangladesh. High resolution.` }]
        },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      if (imageResult?.candidates?.[0]?.content?.parts) {
        const part = imageResult.candidates[0].content.parts.find(p => p.inlineData);
        if (part?.inlineData) {
          generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } catch (imgErr) {
      console.warn("Image generation skipped due to quota or error:", imgErr);
      // We continue even if image fails, as text is the primary info
    }

    onComplete({
      text: fullText,
      sources: groundingSources,
      imageUrl: generatedImageUrl
    });

  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    
    // Check for specific 429 error
    if (error.message?.includes("429") || error.message?.includes("QUOTA") || error.message?.includes("EXHAUSTED")) {
      throw new Error("দুঃখিত, বর্তমানে সার্ভারে অনেক চাপ রয়েছে (Quota Exceeded)। অনুগ্রহ করে ১ মিনিট পর আবার চেষ্টা করুন।");
    }
    
    throw new Error(error.message || "তথ্য সংগ্রহে সমস্যা হয়েছে।");
  }
};

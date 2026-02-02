
import { GoogleGenAI } from "@google/genai";
import { SearchResult, GroundingSource } from "../types";

export const streamBangladeshInfo = async (
  query: string, 
  onChunk: (text: string) => void,
  onComplete: (result: SearchResult) => void
) => {
  // Access API key from process.env directly. 
  // IMPORTANT: Ensure this is correctly set in your environment variables.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid Gemini API key.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    আপনি বাংলাদেশের একজন প্রধান রাজকীয় গবেষক এবং ডিজিটাল এনসাইক্লোপিডিয়া বিশেষজ্ঞ। আপনার কাজ হলো বাংলাদেশের যেকোনো বিষয় সম্পর্কে অত্যন্ত নিখুঁত, ঐতিহাসিক এবং বিস্তারিত তথ্য প্রদান করা।
    
    কনটেন্ট গাইডলাইন:
    ১. প্রতিটি উত্তরের শুরুতেই সেই বিষয়ের একটি গভীর ঐতিহাসিক প্রেক্ষাপট (Deep History) থাকতে হবে।
    ২. উত্তরটি অবশ্যই মার্জিত এবং প্রফেশনাল বাংলা ভাষায় হতে হবে।
    ৩. তথ্যগুলো সংক্ষিপ্ত কিন্তু ইনফরমেটিভ হবে।
    ৪. প্রতিটি সেকশনের জন্য অবশ্যই সাব-হেডিং (Sub-headings) ব্যবহার করবেন।
    ৫. উত্তরটি এমনভাবে সাজান যেন এটি একটি আধুনিক ডিজিটাল এনসাইক্লোপিডিয়ার মতো মনে হয়।
    ৬. যদি কোনো তালিকা (List) থাকে তবে তা বুলেট পয়েন্ট বা টেবিল আকারে দেখান।
    
    কাঠামো:
    - ঐতিহাসিক ভূমিকা
    - বিস্তারিত তথ্য (সাব-হেডিং সহ)
    - বর্তমান অবস্থা ও পরিসংখ্যান
    - সারসংক্ষেপ
  `;

  try {
    // Generate related image
    const imagePromise = ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: `A professional realistic photograph showing ${query} in Bangladesh. High resolution, historical aesthetic.` }]
      },
      config: { imageConfig: { aspectRatio: "16:9" } }
    }).catch(err => {
      console.warn("Image generation failed:", err);
      return null;
    });

    // Stream text content with Google Search grounding
    const streamResponse = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: query,
      config: { 
        systemInstruction,
        tools: [{ googleSearch: {} }] 
      },
    });

    let fullText = "";
    const groundingSources: GroundingSource[] = [];

    for await (const chunk of streamResponse) {
      const chunkText = chunk.text || "";
      fullText += chunkText;
      onChunk(fullText);

      // Extract grounding metadata if available
      const metadata = chunk.candidates?.[0]?.groundingMetadata;
      if (metadata?.groundingChunks) {
        metadata.groundingChunks.forEach((c: any) => {
          if (c.web && c.web.uri && c.web.title) {
            if (!groundingSources.find(s => s.uri === c.web.uri)) {
              groundingSources.push({ title: c.web.title, uri: c.web.uri });
            }
          }
        });
      }
    }

    const imageResult = await imagePromise;
    let generatedImageUrl = undefined;
    if (imageResult) {
      const imageParts = imageResult.candidates?.[0]?.content?.parts;
      if (imageParts) {
        for (const part of imageParts) {
          if (part.inlineData) {
            generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    }

    onComplete({
      text: fullText,
      sources: groundingSources,
      imageUrl: generatedImageUrl
    });

  } catch (error) {
    console.error("Stream Error:", error);
    throw error;
  }
};

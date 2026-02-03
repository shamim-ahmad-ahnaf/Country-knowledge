
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    আপনি বাংলাদেশের একজন প্রধান রাজকীয় ইতিহাসবিদ এবং ডিজিটাল এনসাইক্লোপিডিয়া বিশেষজ্ঞ। 
    আপনার লক্ষ্য হলো ব্যবহারকারীকে বাংলাদেশের যেকোনো বিষয় সম্পর্কে অত্যন্ত নিখুঁত, ঐতিহাসিক এবং আকর্ষণীয় তথ্য প্রদান করা।
    
    নির্দেশনা:
    ১. উত্তরটি অবশ্যই মার্জিত এবং উচ্চমানের বাংলা ভাষায় হতে হবে।
    ২. উত্তরের শুরুতে একটি আকর্ষণীয় 'ঐতিহাসিক ভূমিকা' (Historical Introduction) দিন।
    ৩. প্রতিটি সেকশনের জন্য স্পষ্ট হেডিং (Markdown ## বা ###) ব্যবহার করুন।
    ৪. গুরুত্বপূর্ণ তথ্যগুলো অবশ্যই বুলেট পয়েন্ট বা নম্বরযুক্ত তালিকায় দেখান।
    ৫. সম্ভব হলে একটি "একনজরে মূল তথ্য" (Quick Highlights) সেকশন যুক্ত করুন।
    ৬. উত্তরটি এমনভাবে সাজান যেন এটি একটি প্রিমিয়াম ডিজিটাল মিউজিয়ামের গাইডবুক মনে হয়।
    
    কাঠামো:
    # [বিষয়ের নাম]
    [সংক্ষিপ্ত ভূমিকা]
    
    ## ঐতিহাসিক প্রেক্ষাপট
    [বিস্তারিত ইতিহাস]
    
    ## মূল বৈশিষ্ট্য ও গুরুত্ব
    - [পয়েন্ট ১]
    - [পয়েন্ট ২]
    
    ## বর্তমান অবস্থা ও পরিসংখ্যান
    [তথ্য]
    
    ## সারসংক্ষেপ
    [উপসংহার]
  `;

  try {
    // Generate image in parallel for better UX
    const imagePromise = ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: `A professional, breathtaking cinematic wide-angle photograph of ${query} in Bangladesh. High resolution, National Geographic style, historical significance.` }]
      },
      config: { imageConfig: { aspectRatio: "16:9" } }
    }).catch(err => {
      console.warn("Image generation failed:", err);
      return null;
    });

    // Stream text content using Gemini 3 Pro for complex reasoning and search
    const streamResponse = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: `বাংলাদেশ সম্পর্কে বিস্তারিত এনসাইক্লোপিডিয়া তথ্য দাও: ${query}` }] }],
      config: { 
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    let fullText = "";
    const groundingSources: GroundingSource[] = [];

    for await (const chunk of streamResponse) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(fullText);
      }

      // Collect grounding sources
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

    const imageResult = await imagePromise;
    let generatedImageUrl = undefined;
    
    if (imageResult?.candidates?.[0]?.content?.parts) {
      const part = imageResult.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    onComplete({
      text: fullText,
      sources: groundingSources,
      imageUrl: generatedImageUrl
    });

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};

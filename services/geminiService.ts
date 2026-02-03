
import { GoogleGenAI } from "@google/genai";
import { SearchResult, GroundingSource } from "../types";

/**
 * Service to interact with Gemini API for streaming encyclopedia information.
 * Image generation is removed to prioritize text quota and prevent 429 errors.
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
    // Stream text content using Gemini 3 Flash for efficiency and reliability
    const streamResponse = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `বাংলাদেশ সম্পর্কে বিস্তারিত এবং নির্ভুল এনসাইক্লোপিডিয়া তথ্য দাও: ${query}` }] }],
      config: { 
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.3, // Lower temperature for factual accuracy
      },
    });

    let fullText = "";
    const groundingSources: GroundingSource[] = [];

    for await (const chunk of streamResponse) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(fullText);
      }

      // Collect grounding sources from metadata if Google Search was used
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
      throw new Error("সার্ভার থেকে কোনো তথ্য পাওয়া যায়নি। অনুগ্রহ করে অন্য কিছু লিখে চেষ্টা করুন।");
    }

    // Return result without imageUrl as per user request to save quota
    onComplete({
      text: fullText,
      sources: groundingSources,
      imageUrl: undefined
    });

  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    
    // Specifically handle quota errors
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED") || error.message?.includes("QUOTA")) {
      throw new Error("দুঃখিত, বর্তমানে সার্ভারের ফ্রি কোটা শেষ হয়ে গেছে। অনুগ্রহ করে ১ মিনিট পর আবার চেষ্টা করুন।");
    }
    
    throw new Error(error.message || "তথ্য সংগ্রহে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।");
  }
};

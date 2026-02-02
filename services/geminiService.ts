
import { GoogleGenAI } from "@google/genai";
import { SearchResult, GroundingSource } from "../types";

export const streamBangladeshInfo = async (
  query: string, 
  onChunk: (text: string) => void,
  onComplete: (result: SearchResult) => void
) => {
  // Use the API key directly from process.env as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    আপনি বাংলাদেশের একজন বিশেষজ্ঞ গবেষক। আপনার কাজ হলো বাংলাদেশের যেকোনো বিষয় সম্পর্কে নিখুঁত, ঐতিহাসিক এবং বিস্তারিত তথ্য প্রদান করা।
    
    নির্দেশনা:
    ১. উত্তরের শুরুতে বিষয়টির গভীর ঐতিহাসিক প্রেক্ষাপট থাকতে হবে।
    ২. প্রফেশনাল বাংলা ভাষা ব্যবহার করুন।
    ৩. তথ্যবহুল কিন্তু পড়ার উপযোগী সাব-হেডিং ব্যবহার করুন।
    ৪. তালিকা থাকলে বুলেট পয়েন্ট ব্যবহার করুন।
    
    কাঠামো:
    - ঐতিহাসিক ভূমিকা
    - মূল তথ্য (সাব-হেডিং সহ)
    - বর্তমান পরিস্থিতি
    - সারসংক্ষেপ
  `;

  try {
    // Start image generation separately to not block text
    const imagePromise = ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: `A realistic high-quality historical or landmark photograph of ${query} in Bangladesh.` }]
      },
      config: { imageConfig: { aspectRatio: "16:9" } }
    }).catch(err => {
      console.error("Image generation failed:", err);
      return null;
    });

    // Use gemini-3-flash-preview for faster, reliable streaming
    const streamResponse = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: query }] }],
      config: { 
        systemInstruction,
        tools: [{ googleSearch: {} }] 
      },
    });

    let fullText = "";
    const groundingSources: GroundingSource[] = [];

    for await (const chunk of streamResponse) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(fullText);
      }

      // Handle grounding metadata
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

    // Wait for image if it's still generating, but with a timeout or handled failure
    const imageResult = await imagePromise;
    let generatedImageUrl = undefined;
    if (imageResult) {
      const part = imageResult.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
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

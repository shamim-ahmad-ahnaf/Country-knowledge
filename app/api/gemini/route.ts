import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // edge নয়

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query missing" },
        { status: 400 }
      );
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API_KEY missing in server env" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
      আপনি বাংলাদেশের একজন প্রধান রাজকীয় ইতিহাসবিদ এবং এনসাইক্লোপিডিয়া বিশেষজ্ঞ।
      উত্তর অবশ্যই শুদ্ধ, আধুনিক ও মার্জিত বাংলায় হবে।
      প্রয়োজনে Google Search ব্যবহার করুন।
      Markdown ব্যবহার করে সুন্দরভাবে সাজিয়ে লিখুন।
    `;

    const stream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: `বাংলাদেশ সম্পর্কে বিস্তারিত ও নির্ভুল তথ্য দাও: ${query}` }
          ]
        }
      ],
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    let fullText = "";
    const sources: { title: string; uri: string }[] = [];

    for await (const chunk of stream) {
      if (chunk.text) {
        fullText += chunk.text;
      }

      const metadata = chunk.candidates?.[0]?.groundingMetadata;
      if (metadata?.groundingChunks) {
        metadata.groundingChunks.forEach((c: any) => {
          if (c.web?.uri && c.web?.title) {
            if (!sources.find(s => s.uri === c.web.uri)) {
              sources.push({
                title: c.web.title,
                uri: c.web.uri,
              });
            }
          }
        });
      }
    }

    if (!fullText) {
      return NextResponse.json(
        { error: "No content generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      text: fullText,
      sources,
    });

  } catch (err: any) {
    console.error("Gemini API error:", err);

    const msg = err?.message || "";

    if (msg.includes("429") || msg.includes("QUOTA")) {
      return NextResponse.json(
        { error: "Quota exceeded" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

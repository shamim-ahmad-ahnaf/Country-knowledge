
import { SearchResult } from "../types";

/**
 * Service to call our internal secure API route.
 * This ensures the API key remains server-side only.
 */
export const streamBangladeshInfo = async (
  query: string, 
  onChunk: (text: string) => void,
  onComplete: (result: SearchResult) => void
) => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

if (!response.ok) {
  throw new Error(data.error || "সার্ভারে সমস্যা হয়েছে।");
}


    const data = await response.json();
    
    // Since the API route currently returns a full JSON (not streaming for simplicity/stability),
    // we simulate a single chunk for the UI compatibility.
    onChunk(data.text);
    
    onComplete({
      text: data.text,
      sources: data.sources || [],
      imageUrl: undefined
    });

  } catch (error: any) {
    console.error("Frontend Service Error:", error);
    throw new Error(error.message || "তথ্য সংগ্রহ করতে ব্যর্থ হয়েছি।");
  }
};

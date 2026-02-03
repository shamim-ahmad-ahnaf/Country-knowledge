
import { SearchResult } from "../types";

/**
 * Service to call our internal secure API route.
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

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        // If the error message is already refined by our API route, use it
        throw new Error(errorData.error || "সার্ভারে সমস্যা হয়েছে।");
      } else {
        throw new Error(`সার্ভার থেকে অপ্রত্যাশিত রেসপন্স (Status: ${response.status})।`);
      }
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("সার্ভার থেকে আসা ডাটা সঠিক JSON ফরম্যাটে নেই।");
    }
    
    if (!data || !data.text) {
      throw new Error("সার্ভার থেকে কোনো তথ্য পাওয়া যায়নি।");
    }

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

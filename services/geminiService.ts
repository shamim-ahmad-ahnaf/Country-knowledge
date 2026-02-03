
import { SearchResult } from "../types";

/**
 * Service to call our internal secure API route.
 * Handles potential HTML error responses from the server.
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

    // Handle non-OK responses
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      
      // If server returns JSON error
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error || "সার্ভারে সমস্যা হয়েছে।");
      } else {
        // If server returns HTML (like a 404 or Vercel error page)
        if (response.status === 404) {
          throw new Error("API রুটটি খুঁজে পাওয়া যাচ্ছে না (/api/gemini)। দয়া করে নিশ্চিত করুন যে api/ ফোল্ডারটি সঠিক জায়গায় আছে এবং Redeploy করেছেন।");
        }
        throw new Error(`সার্ভার থেকে অপ্রত্যাশিত রেসপন্স এসেছে (Status: ${response.status})।`);
      }
    }

    // Attempt to parse successful JSON
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("সার্ভার থেকে আসা ডাটা সঠিক JSON ফরম্যাটে নেই।");
    }
    
    if (!data || !data.text) {
      throw new Error("সার্ভার থেকে কোনো তথ্য পাওয়া যায়নি।");
    }

    // Simulate streaming for UI compatibility
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

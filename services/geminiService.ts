import type { AiAnalysis, DownloadFormat, BrandPackData } from '../types';

/**
 * Generate image by proxying to the Express backend /api/generate-image endpoint.
 * This keeps the API key hidden from the client browser.
 */
export const generateImage = async (
  fullPrompt: string, 
  outputMimeType: DownloadFormat = 'image/jpeg'
): Promise<string> => {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        aspectRatio: '1:1', // Default ratio for signature, monogram, typography etc.
        model: 'gemini-3.1-flash-image-preview' // default image generation model
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to generate image via proxy");
    }

    return data.imageUrl;
  } catch (error: any) {
    console.error("Error in generateImage:", error);
    throw new Error(error.message || "An unknown error occurred while communicating with the image generation service.");
  }
};

/**
 * Regenerate image with inpainting / editing via proxy.
 */
export const regenerateImage = async (
  base64Data: string,
  mimeType: string,
  userPrompt: string,
  style: string,
  outputMimeType: DownloadFormat = 'image/jpeg'
): Promise<string> => {
  try {
    const promptWithStyle = userPrompt.trim() 
      ? `${userPrompt}, style: ${style}` 
      : `Replicate this image in a pristine ${style} style.`;

    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: promptWithStyle,
        base64Image: base64Data,
        mimeType: mimeType,
        aspectRatio: '1:1',
        model: 'gemini-3.1-flash-image-preview'
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to edit image");
    }

    return data.imageUrl;
  } catch (error: any) {
    console.error("Error in regenerateImage:", error);
    throw new Error(error.message || "An unknown error occurred during the image editing process.");
  }
};

/**
 * Surprise Me image generation. First analyses image concepts, then generates.
 */
export const surpriseMeImage = async (
  base64Data: string,
  mimeType: string,
  outputMimeType: DownloadFormat = 'image/jpeg'
): Promise<{ imageUrl: string; newPrompt: string; newStyle: string; }> => {
  try {
    // 1. Ask Gemini to analyze the image and return a surprise concept
    const analysisResponse = await fetch('/api/gemini-intelligence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: `Analyze this image and invent a completely new, highly imaginative, and artistic vision to regenerate this image with a unique twist.
Your response MUST be a single, valid JSON object with exactly two keys:
1. "prompt": A highly-descriptive prompt for a text-to-image AI describing the new vision.
2. "style": A matching creative style (e.g., "Neon Wave", "Gothic Fantasy", "Surrealism").
Output ONLY the JSON object. Do not add markdown backticks.`,
        fileBase64: base64Data,
        mimeType: mimeType,
        useThinking: false
      })
    });

    const analysisData = await analysisResponse.json();
    if (!analysisResponse.ok) {
      throw new Error(analysisData.error || "Failed to analyze image for surprise");
    }

    let parsed;
    try {
      let cleanText = analysisData.text.trim();
      // Remove possible markdown code block fences
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      }
      parsed = JSON.parse(cleanText);
    } catch {
      parsed = {
        prompt: "A magical cosmic version of the input, floating in stardust, cinematic lighting, high-fidelity",
        style: "Cosmic Cyberpunk"
      };
    }

    const newPrompt = parsed.prompt || "Cybernetic neon future";
    const newStyle = parsed.style || "Retro Cyberpunk";

    // 2. Generate the surprise image using our proxy
    const finalPrompt = `${newPrompt}, style of ${newStyle}`;
    const imageUrl = await generateImage(finalPrompt, outputMimeType);

    return { imageUrl, newPrompt, newStyle };
  } catch (error: any) {
    console.error("Error in surpriseMeImage:", error);
    throw new Error(error.message || "Failed to create surprise image.");
  }
};

/**
 * Get AI analysis & suggestions from prompt or user input.
 */
export const getAiEnhancementSuggestions = async (promptForAnalysis: string): Promise<AiAnalysis> => {
  try {
    const response = await fetch('/api/gemini-intelligence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: promptForAnalysis + `\n\nYour response MUST be a single, valid JSON object matching this structure:
{
  "explanation": "Brief paragraph explaining suggestions",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
}
Output ONLY the JSON object, without code fence backticks.`,
        useThinking: false
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "AI suggestions analysis failed");
    }

    let cleanText = data.text.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(cleanText);
    return {
      explanation: parsed.explanation || "Aesthetic audit completed.",
      suggestions: parsed.suggestions || []
    };
  } catch (error: any) {
    console.error("Error getting AI suggestions:", error);
    return {
      explanation: "Unable to process aesthetic audit. Please try again later.",
      suggestions: ["Incorporate clean corporate colors", "Use minimalistic typography", "Increase visual whitespace"]
    };
  }
};

/**
 * Generate Brand strategy from prompt parameters.
 */
export const generateBrandPackStrategy = async (
  companyName: string,
  industry: string,
  keywords: string,
  style: string
): Promise<BrandPackData> => {
  try {
    const response = await fetch('/api/brand-strategy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        companyName,
        industry,
        keywords,
        style
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to generate brand pack");
    }

    return data;
  } catch (error: any) {
    console.error("Error in generateBrandPackStrategy:", error);
    throw new Error(error.message || "Failed to construct the brand strategy pack.");
  }
};

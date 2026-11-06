import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, GenerateVideosOperation } from "@google/genai";

const app = express();
const PORT = 3000;

// Set payload limits for base64 uploads
app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ limit: "150mb", extended: true }));

// Retrieve the API Key safely
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("WARNING: Neither API_KEY nor GEMINI_API_KEY environment variable is set.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_KEY" });

// Helper to check apiKey
const checkApiKey = (res: express.Response) => {
  if (!apiKey) {
    res.status(500).json({ error: "Gemini API key is not configured on the server." });
    return false;
  }
  return true;
};

// ==========================================
// 1. IMAGE PALETTE & COLOR ANALYSIS
// ==========================================
app.post("/api/analyze-palette", async (req, res) => {
  if (!checkApiKey(res)) return;
  const { imageBase64, mimeType } = req.body;
  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ error: "Missing imageBase64 or mimeType" });
  }

  try {
    const prompt = `Analyze this image as a professional creative director. Extract a highly cohesive four-color brand palette that represents its primary tones, mood, and aesthetic.
    
Your response MUST be a single, valid JSON object with the following keys:
{
  "primary": "Hex color code (e.g., #1F2E3D)",
  "secondary": "Hex color code (e.g., #4B5C6D)",
  "accent1": "Hex color code (e.g., #E89B24)",
  "accent2": "Hex color code (e.g., #10B981)"
}

Do not output any explanation or extra text. Output ONLY the JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { inlineData: { data: imageBase64, mimeType } },
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    res.json(JSON.parse(response.text?.trim() || "{}"));
  } catch (error: any) {
    console.error("Analyze Palette Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze palette" });
  }
});

// ==========================================
// 2. BRAND PACK GENERATOR STRATEGY
// ==========================================
app.post("/api/brand-strategy", async (req, res) => {
  if (!checkApiKey(res)) return;
  const { companyName, industry, keywords, style } = req.body;
  if (!companyName || !industry) {
    return res.status(400).json({ error: "Missing companyName or industry" });
  }

  try {
    const brandPrompt = `You are an elite brand strategist and designer. Generate a cohesive brand strategy and asset generation prompts for a company named "${companyName}" in the industry "${industry}".
The brand's core concept/keywords are "${keywords || 'innovation, premium'}" and the chosen style is "${style}".

Your response MUST be a single, valid JSON object that fits the BrandPackData TypeScript interface:
{
  "companyName": "${companyName}",
  "industry": "${industry}",
  "style": "${style.replace(/"/g, '\\"')}",
  "slogan": "A powerful, catchy brand slogan",
  "story": "A 2-sentence highly inspiring brand origin/mission story",
  "pillars": [
    { "title": "Pillar 1 Title", "description": "Brief description of brand pillar 1" },
    { "title": "Pillar 2 Title", "description": "Brief description of brand pillar 2" },
    { "title": "Pillar 3 Title", "description": "Brief description of brand pillar 3" }
  ],
  "palette": {
    "primary": "Hex color code matching the style",
    "secondary": "Hex color code matching",
    "accent": "Hex color code matching",
    "background": "Hex color code matching",
    "primaryName": "Creative name for primary color",
    "secondaryName": "Creative name for secondary color",
    "accentName": "Creative name for accent color",
    "backgroundName": "Creative name for background color",
    "primaryDesc": "Why this primary color works for this brand",
    "secondaryDesc": "Why this secondary color works for this brand",
    "accentDesc": "Why this accent color works for this brand",
    "backgroundDesc": "Why this background color works for this brand"
  },
  "typography": {
    "headingFont": "A professional Google Font name",
    "headingFontUrl": "Google font import slug",
    "bodyFont": "A legible Google Font name",
    "bodyFontUrl": "Google font import slug",
    "pairDescription": "Why this font pairing is ideal for this brand"
  },
  "assets": {
    "logoPrompt": "A detailed text-to-image prompt to generate a world-class professional logo for '${companyName}' based in the '${industry}' industry. It must specify: flat vector art, solid light background, minimalist, high contrast, matching the style style of '${style}'. No text.",
    "businessCardPrompt": "A detailed text-to-image prompt to generate a flat lay minimalist luxury business card mockup for '${companyName}' in the style of '${style}'. Clean layout, high-end printing, photo-realistic, studio lighting, professional card presentation.",
    "bannerPrompt": "A detailed text-to-image prompt to generate a professional abstract horizontal background banner or header illustration for '${companyName}' matching the style '${style}'. Clean compositions, sophisticated color theory, premium aesthetic, 16:9 aspect ratio."
  }
}

Output ONLY the JSON object. Do not add any markdown, explanation, or extra characters.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: brandPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    res.json(JSON.parse(response.text?.trim() || "{}"));
  } catch (error: any) {
    console.error("Brand Strategy Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate brand strategy" });
  }
});

// ==========================================
// 3. IMAGE GENERATION / CREATION & EDITING
// ==========================================
app.post("/api/generate-image", async (req, res) => {
  if (!checkApiKey(res)) return;
  const { prompt, model, aspectRatio, imageSize, base64Image, mimeType } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  const selectedModel = model || 'gemini-3.1-flash-image-preview';
  console.log(`Requested Image Gen. Model: ${selectedModel}, AspectRatio: ${aspectRatio || '1:1'}, Size: ${imageSize || '1K'}`);

  const parts: any[] = [];
  if (base64Image && mimeType) {
    parts.push({
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    });
  }
  parts.push({ text: prompt });

  // Fallback chain to ensure successful image generation even if requested pro/flash models hit quota limits of 0
  const modelsToTry = [selectedModel];
  const fallbacks = [
    "gemini-3.1-flash-lite-image-preview",
    "gemini-3.1-flash-lite-image",
    "gemini-3.1-flash-image-preview",
    "gemini-3.1-flash-image"
  ];

  for (const fb of fallbacks) {
    if (!modelsToTry.includes(fb)) {
      modelsToTry.push(fb);
    }
  }

  let lastError: any = null;
  let success = false;
  let imageUrl: string | null = null;

  for (const currentModel of modelsToTry) {
    try {
      console.log(`Attempting image generation with model: ${currentModel}`);
      
      const currentConfig: any = {
        imageConfig: {
          aspectRatio: aspectRatio || "1:1"
        }
      };

      // Support imageSize configuration only for pro or flash models if available
      if (imageSize && (currentModel.includes("pro") || currentModel.includes("flash-image"))) {
        if (!currentModel.includes("lite")) {
          currentConfig.imageConfig.imageSize = imageSize;
        }
      }

      const response = await ai.models.generateContent({
        model: currentModel,
        contents: { parts },
        config: currentConfig
      });

      let foundImage = false;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            foundImage = true;
            const base64Data = part.inlineData.data;
            const returnedMime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${returnedMime};base64,${base64Data}`;
            break;
          }
        }
      }

      if (foundImage && imageUrl) {
        console.log(`Successfully generated image using model: ${currentModel}`);
        success = true;
        break;
      } else {
        console.warn(`Model ${currentModel} returned successfully but no inlineData part was found.`);
      }
    } catch (err: any) {
      console.warn(`Error generating image with model ${currentModel}:`, err.message || err);
      lastError = err;
    }
  }

  if (success && imageUrl) {
    return res.json({ imageUrl });
  }

  const errorMessage = lastError?.message || (lastError ? JSON.stringify(lastError) : "All fallback image models failed to generate content.");
  console.error("All image generation models in the fallback chain failed:", errorMessage);
  res.status(500).json({ error: errorMessage });
});

// ==========================================
// 4. VEO VIDEO GENERATION (3-STEP PATTERN)
// ==========================================
app.post("/api/generate-video", async (req, res) => {
  if (!checkApiKey(res)) return;
  const { prompt, imageBytes, mimeType, aspectRatio } = req.body;

  try {
    console.log(`Starting Veo Video Generation. Aspect Ratio: ${aspectRatio || '16:9'}`);

    const imageParam = imageBytes && mimeType ? {
      imageBytes: imageBytes,
      mimeType: mimeType
    } : undefined;

    const operation = await ai.models.generateVideos({
      model: "veo-3.1-fast-generate-preview",
      prompt: prompt || "A professional cinematically aesthetic motion sequence",
      image: imageParam,
      config: {
        numberOfVideos: 1,
        resolution: "720p",
        aspectRatio: aspectRatio || "16:9"
      }
    });

    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error("Generate Video Error:", error);
    res.status(500).json({ error: error.message || "Failed to start video generation" });
  }
});

app.post("/api/video-status", async (req, res) => {
  if (!checkApiKey(res)) return;
  const { operationName } = req.body;
  if (!operationName) {
    return res.status(400).json({ error: "Missing operationName" });
  }

  try {
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    res.json({ done: updated.done, error: updated.error });
  } catch (error: any) {
    console.error("Video Status Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch video status" });
  }
});

app.post("/api/video-download", async (req, res) => {
  if (!checkApiKey(res)) return;
  const { operationName } = req.body;
  if (!operationName) {
    return res.status(400).json({ error: "Missing operationName" });
  }

  try {
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    
    if (!updated.done) {
      return res.status(400).json({ error: "Video generation is not completed yet." });
    }

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(500).json({ error: "Could not find video download URI." });
    }

    console.log(`Streaming video from URI: ${uri}`);
    const videoRes = await fetch(uri, {
      headers: { "x-goog-api-key": apiKey || "" }
    });

    res.setHeader("Content-Type", "video/mp4");
    
    const arrayBuffer = await videoRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error: any) {
    console.error("Video Download Error:", error);
    res.status(500).json({ error: error.message || "Failed to stream video file" });
  }
});

// ==========================================
// 5. GEMINI INTELLIGENCE & HIGH THINKING
// ==========================================
app.post("/api/gemini-intelligence", async (req, res) => {
  if (!checkApiKey(res)) return;
  const { prompt, fileBase64, mimeType, useThinking, model } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const contents: any[] = [];
    
    if (fileBase64 && mimeType) {
      contents.push({
        inlineData: {
          data: fileBase64,
          mimeType: mimeType
        }
      });
    }
    
    contents.push({ text: prompt });

    const config: any = {};
    let selectedModel = model || "gemini-3.5-flash";

    if (useThinking) {
      // High thinking mode requirements
      selectedModel = "gemini-3.1-pro-preview";
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH
      };
      // Do not set maxOutputTokens
    }

    console.log(`Gemini Intelligence. Model: ${selectedModel}, useThinking: ${useThinking}`);

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: contents,
      config: config
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Intelligence Error:", error);
    res.status(500).json({ error: error.message || "Failed to execute Gemini request" });
  }
});

// ==========================================
// VITE DEV SERVER OR STATIC ASSETS serving
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

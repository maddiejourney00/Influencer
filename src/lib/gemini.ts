import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const IMAGE_MODEL = "gemini-3.1-flash-image-preview";

export interface GeminiUsage {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  imageTokens: number;
  imageCount: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractUsage(response: any, isImageGen: boolean = false): GeminiUsage {
  const meta = response.usageMetadata;
  const imageDetail = meta?.candidatesTokensDetails?.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (d: any) => d.modality === "IMAGE"
  );
  return {
    promptTokens: meta?.promptTokenCount ?? 0,
    candidatesTokens: meta?.candidatesTokenCount ?? 0,
    totalTokens: meta?.totalTokenCount ?? 0,
    imageTokens: imageDetail?.tokenCount ?? 0,
    imageCount: isImageGen ? 1 : 0,
  };
}

export async function generateHeroImage(
  referenceImages: string[],
  idea: string
) {
  const contents = [
    {
      text: `You are a creative director for an influencer's Instagram content.

Create a stunning, Instagram-worthy hero image based on the following concept idea and the reference images provided. The reference images show the desired aesthetic, mood, color palette, and visual style.

CONCEPT: ${idea}

Requirements:
- Create a visually striking, high-quality image suitable for Instagram
- Draw inspiration from the style, mood, and aesthetics of all reference images
- The image should be cohesive, professional, and eye-catching
- This is a base/hero image that will be used as the creative direction for variations`,
    },
    ...referenceImages.map((img) => ({
      inlineData: {
        mimeType: "image/jpeg" as const,
        data: img,
      },
    })),
  ];

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents,
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: "3:4",
        imageSize: "2K",
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No response from Gemini");

  let imageData: string | null = null;

  for (const part of parts) {
    if (part.inlineData) {
      imageData = part.inlineData.data!;
    }
  }

  if (!imageData) throw new Error("No image generated");

  return { imageData, description: idea, usage: extractUsage(response, true) };
}

export async function generateVariationPrompts(
  idea: string,
  heroDescription: string,
  systemPrompt: string
) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Original content idea: ${idea}

Hero image description: ${heroDescription}

Generate exactly 4 variation prompts. Each should describe a distinct image that would work alongside the hero in an Instagram carousel. Variations should explore different angles, moods, compositions, or scenarios while maintaining visual coherence with the hero.

Output ONLY a JSON array of 4 strings. No other text.`,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  const prompts: string[] = JSON.parse(text);
  if (!Array.isArray(prompts) || prompts.length !== 4) {
    throw new Error("Expected exactly 4 prompts");
  }

  return { prompts, usage: extractUsage(response) };
}

export async function generateVariationImage(
  variationPrompt: string,
  referenceImages: string[],
  heroImageBase64: string
) {
  const contents = [
    {
      text: `Generate an Instagram photo based on the following description.

The reference images show the person, style, and aesthetic to maintain. The HERO image sets the creative direction and theme.

Create a NEW composition based on the variation description below, keeping the same person, visual style, and mood from the references.

VARIATION DESCRIPTION: ${variationPrompt}`,
    },
    ...referenceImages.map((img) => ({
      inlineData: {
        mimeType: "image/jpeg" as const,
        data: img,
      },
    })),
    {
      inlineData: {
        mimeType: "image/jpeg" as const,
        data: heroImageBase64,
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents,
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: "3:4",
        imageSize: "2K",
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No response from Gemini");

  let imageData: string | null = null;

  for (const part of parts) {
    if (part.inlineData) {
      imageData = part.inlineData.data!;
    }
  }

  if (!imageData) throw new Error("No image generated");

  return { imageData, description: variationPrompt, usage: extractUsage(response, true) };
}

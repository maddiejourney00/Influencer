import { NextRequest, NextResponse } from "next/server";
import { generateVariationImage } from "@/lib/gemini";
import { saveImage, loadImageAsBase64, stripDataUrl } from "@/lib/images";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { variationPrompt, variationIndex, sessionId, heroImagePath, referenceImages } =
      await req.json();

    if (!variationPrompt || variationIndex == null || !sessionId || !heroImagePath) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const refBase64 = (referenceImages || []).map((img: string) =>
      stripDataUrl(img)
    );

    const heroBase64 = await loadImageAsBase64(
      path.join(process.cwd(), "public", heroImagePath)
    );

    const { imageData, description, usage } = await generateVariationImage(
      variationPrompt,
      refBase64,
      heroBase64
    );

    const url = await saveImage(
      imageData,
      sessionId,
      `variation-${variationIndex}.jpg`
    );

    return NextResponse.json({ imageUrl: url, description, usage });
  } catch (error) {
    console.error("Generate variation error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate variation image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

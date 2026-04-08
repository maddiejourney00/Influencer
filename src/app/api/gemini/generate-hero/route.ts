import { NextRequest, NextResponse } from "next/server";
import { generateHeroImage } from "@/lib/gemini";
import { saveImage, stripDataUrl } from "@/lib/images";

export async function POST(req: NextRequest) {
  try {
    const { referenceImages, idea, sessionId } = await req.json();

    if (!referenceImages?.length || !idea || !sessionId) {
      return NextResponse.json(
        { error: "Missing referenceImages, idea, or sessionId" },
        { status: 400 }
      );
    }

    const base64Images = referenceImages.map((img: string) =>
      stripDataUrl(img)
    );

    const { imageData, description, usage } = await generateHeroImage(
      base64Images,
      idea
    );

    const url = await saveImage(imageData, sessionId, "hero.jpg");

    return NextResponse.json({ imageUrl: url, description, usage });
  } catch (error) {
    console.error("Generate hero error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate hero image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateVariationPrompts } from "@/lib/gemini";
import { getSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  try {
    const { idea, heroDescription } = await req.json();

    if (!idea || !heroDescription) {
      return NextResponse.json(
        { error: "Missing idea or heroDescription" },
        { status: 400 }
      );
    }

    const settings = await getSettings();
    const { prompts, usage } = await generateVariationPrompts(
      idea,
      heroDescription,
      settings.systemPrompt
    );

    return NextResponse.json({ prompts, usage });
  } catch (error) {
    console.error("Generate prompts error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate variation prompts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

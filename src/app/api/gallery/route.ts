import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const OUTPUT_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "public", "output");

interface GallerySession {
  sessionId: string;
  images: string[];
  createdAt: string;
}

export async function GET() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    const entries = await fs.readdir(OUTPUT_DIR, { withFileTypes: true });

    const sessions: GallerySession[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const sessionDir = path.join(OUTPUT_DIR, entry.name);
      const files = await fs.readdir(sessionDir);
      const images = files
        .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .map((f) => `/output/${entry.name}/${f}`);

      if (images.length === 0) continue;

      const stat = await fs.stat(sessionDir);
      sessions.push({
        sessionId: entry.name,
        images,
        createdAt: stat.birthtime.toISOString(),
      });
    }

    // Sort newest first
    sessions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Gallery error:", error);
    return NextResponse.json({ sessions: [] });
  }
}

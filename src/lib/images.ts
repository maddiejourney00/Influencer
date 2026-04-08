import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const OUTPUT_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "public", "output");

export async function ensureSessionDir(sessionId: string): Promise<string> {
  const dir = path.join(OUTPUT_DIR, sessionId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function saveImage(
  base64Data: string,
  sessionId: string,
  filename: string
): Promise<string> {
  const dir = await ensureSessionDir(sessionId);
  const buffer = Buffer.from(base64Data, "base64");

  // Convert to JPEG and resize to Instagram 4:5 (1080x1350)
  const processed = await sharp(buffer)
    .resize(1080, 1350, { fit: "cover" })
    .jpeg({ quality: 90 })
    .toBuffer();

  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, processed);

  return `/output/${sessionId}/${filename}`;
}

export async function loadImageAsBase64(filePath: string): Promise<string> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  const buffer = await fs.readFile(absolutePath);
  return buffer.toString("base64");
}

export function stripDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:[^;]+;base64,(.+)$/);
  return match ? match[1] : dataUrl;
}

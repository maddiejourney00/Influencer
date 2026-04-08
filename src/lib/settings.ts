import fs from "fs/promises";
import path from "path";
import type { AppSettings } from "@/types";
import { DEFAULT_SYSTEM_PROMPT } from "./prompts";

const SETTINGS_PATH = path.join(process.cwd(), "data", "settings.json");

const DEFAULT_SETTINGS: AppSettings = {
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  geminiModel: "gemini-2.0-flash-exp",
  geminiTextModel: "gemini-2.5-flash",
  aspectRatio: "4:5",
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(
  settings: Partial<AppSettings>
): Promise<AppSettings> {
  const current = await getSettings();
  const merged = { ...current, ...settings };
  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(merged, null, 2));
  return merged;
}

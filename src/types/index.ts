export interface GeneratedImage {
  url: string;
  description: string;
}

export interface UsageData {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  imageTokens: number;
  imageCount: number; // number of images generated
}

export interface WizardState {
  sessionId: string;
  step: number;
  referenceImages: string[]; // base64 data URLs
  idea: string;
  heroImage: GeneratedImage | null;
  variationPrompts: string[];
  variationImages: (GeneratedImage | null)[];
  selectedForCarousel: number[]; // indices: 0=hero, 1-4=variations
  caption: string;
  genTimes: number[]; // history of generation durations in ms
  // Token/cost tracking (cumulative across all sessions)
  totalUsage: UsageData;
  sessionUsage: UsageData; // current session only
}

export interface WizardActions {
  setStep: (step: number) => void;
  setReferenceImages: (images: string[]) => void;
  setIdea: (idea: string) => void;
  setHeroImage: (image: GeneratedImage | null) => void;
  setVariationPrompts: (prompts: string[]) => void;
  setVariationImage: (index: number, image: GeneratedImage | null) => void;
  setSelectedForCarousel: (indices: number[]) => void;
  setCaption: (caption: string) => void;
  addGenTime: (ms: number) => void;
  addUsage: (usage: UsageData) => void;
  startNewHero: () => void;
  reset: () => void;
}

export interface AppSettings {
  systemPrompt: string;
  geminiModel: string;
  geminiTextModel: string;
  aspectRatio: string;
}

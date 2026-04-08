"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WizardState, WizardActions, UsageData } from "@/types";

function generateSessionId() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

const emptyUsage: UsageData = {
  promptTokens: 0,
  candidatesTokens: 0,
  totalTokens: 0,
  imageTokens: 0,
  imageCount: 0,
};

const initialState: WizardState = {
  sessionId: generateSessionId(),
  step: 1,
  referenceImages: [],
  idea: "",
  heroImage: null,
  variationPrompts: [],
  variationImages: [null, null, null, null],
  selectedForCarousel: [],
  caption: "",
  genTimes: [],
  totalUsage: { ...emptyUsage },
  sessionUsage: { ...emptyUsage },
};

function addUsageData(a: UsageData, b: UsageData): UsageData {
  return {
    promptTokens: a.promptTokens + b.promptTokens,
    candidatesTokens: a.candidatesTokens + b.candidatesTokens,
    totalTokens: a.totalTokens + b.totalTokens,
    imageTokens: a.imageTokens + b.imageTokens,
    imageCount: a.imageCount + b.imageCount,
  };
}

export const useWizardStore = create<WizardState & WizardActions>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ step }),
      setReferenceImages: (referenceImages) => set({ referenceImages }),
      setIdea: (idea) => set({ idea }),
      setHeroImage: (heroImage) => set({ heroImage }),
      setVariationPrompts: (variationPrompts) => set({ variationPrompts }),
      setVariationImage: (index, image) =>
        set((state) => {
          const variationImages = [...state.variationImages];
          variationImages[index] = image;
          return { variationImages };
        }),
      setSelectedForCarousel: (selectedForCarousel) =>
        set({ selectedForCarousel }),
      setCaption: (caption) => set({ caption }),
      addGenTime: (ms) =>
        set((state) => ({
          genTimes: [...state.genTimes.slice(-19), ms],
        })),
      addUsage: (usage) =>
        set((state) => ({
          totalUsage: addUsageData(state.totalUsage, usage),
          sessionUsage: addUsageData(state.sessionUsage, usage),
        })),
      startNewHero: () =>
        set((state) => ({
          sessionId: generateSessionId(),
          step: 2,
          heroImage: null,
          variationPrompts: [],
          variationImages: [null, null, null, null],
          selectedForCarousel: [],
          caption: "",
          referenceImages: state.referenceImages,
          idea: state.idea,
          genTimes: state.genTimes,
          totalUsage: state.totalUsage,
          sessionUsage: { ...emptyUsage },
        })),
      reset: () =>
        set((state) => ({
          ...initialState,
          sessionId: generateSessionId(),
          genTimes: state.genTimes,
          totalUsage: state.totalUsage,
          sessionUsage: { ...emptyUsage },
        })),
    }),
    {
      name: "influencer-wizard",
      partialize: (state) => ({
        sessionId: state.sessionId,
        step: state.step,
        idea: state.idea,
        heroImage: state.heroImage,
        variationPrompts: state.variationPrompts,
        variationImages: state.variationImages,
        selectedForCarousel: state.selectedForCarousel,
        caption: state.caption,
        genTimes: state.genTimes,
        totalUsage: state.totalUsage,
        sessionUsage: state.sessionUsage,
      }),
    }
  )
);

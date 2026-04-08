"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/hooks/useWizardState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lightbox } from "@/components/wizard/Lightbox";
import { GenProgress } from "@/components/wizard/GenProgress";

export default function Step3Variations() {
  const router = useRouter();
  const {
    sessionId,
    idea,
    heroImage,
    referenceImages,
    variationPrompts,
    setVariationPrompts,
    variationImages,
    setVariationImage,
    setStep,
    addGenTime,
    addUsage,
  } = useWizardStore();

  const [generatingPrompts, setGeneratingPrompts] = useState(false);
  const [generatingImages, setGeneratingImages] = useState<boolean[]>([
    false, false, false, false,
  ]);
  const [error, setError] = useState<string | null>(null);
  const [variationErrors, setVariationErrors] = useState<(string | null)[]>([
    null, null, null, null,
  ]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const startTimes = useRef<Record<number, number>>({});

  const generatePrompts = useCallback(async () => {
    if (!heroImage) return;
    setGeneratingPrompts(true);
    setError(null);

    try {
      const res = await fetch("/api/gemini/generate-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          heroDescription: heroImage.description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.usage) addUsage(data.usage);
      setVariationPrompts(data.prompts);
      return data.prompts as string[];
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate prompts"
      );
      return null;
    } finally {
      setGeneratingPrompts(false);
    }
  }, [heroImage, idea, setVariationPrompts, addUsage]);

  const generateVariation = useCallback(
    async (index: number, prompt: string) => {
      if (!heroImage) return;

      startTimes.current[index] = Date.now();

      setGeneratingImages((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });

      try {
        const res = await fetch("/api/gemini/generate-variation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variationPrompt: prompt,
            variationIndex: index,
            sessionId,
            heroImagePath: heroImage.url,
            referenceImages,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        addGenTime(Date.now() - startTimes.current[index]);
        if (data.usage) addUsage(data.usage);
        setVariationImage(index, {
          url: data.imageUrl,
          description: data.description,
        });
      } catch (err) {
        console.error(`Variation ${index} error:`, err);
        const msg = err instanceof Error ? err.message : "Failed";
        setVariationErrors((prev) => {
          const next = [...prev];
          next[index] = msg;
          return next;
        });
        setVariationImage(index, null);
      } finally {
        setGeneratingImages((prev) => {
          const next = [...prev];
          next[index] = false;
          return next;
        });
      }
    },
    [heroImage, sessionId, referenceImages, setVariationImage, addGenTime, addUsage]
  );

  useEffect(() => {
    if (!heroImage) return;

    const run = async () => {
      let prompts = variationPrompts;
      if (prompts.length === 0) {
        const generated = await generatePrompts();
        if (!generated) return;
        prompts = generated;
      }

      const needsGeneration = variationImages.some((img) => img === null);
      if (needsGeneration) {
        prompts.forEach((prompt, i) => {
          if (!variationImages[i]) {
            generateVariation(i, prompt);
          }
        });
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allDone =
    variationImages.every((img) => img !== null) &&
    !generatingImages.some(Boolean) &&
    !generatingPrompts;

  const handleContinue = () => {
    setStep(4);
    router.push("/wizard/step-4-select");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-3">Variations</h2>
        <p className="text-lg text-muted-foreground">
          Generating 4 variations based on your references and hero.
        </p>
      </div>

      {heroImage && (
        <div
          className="flex items-center gap-4 p-4 bg-muted rounded-lg cursor-zoom-in"
          onClick={() => setLightboxSrc(heroImage.url)}
        >
          <img
            src={heroImage.url}
            alt="Hero"
            className="w-20 h-24 object-cover rounded"
          />
          <div>
            <p className="text-base font-medium">Hero image (locked in)</p>
            <p className="text-sm text-muted-foreground truncate max-w-lg">
              {heroImage.description}
            </p>
          </div>
        </div>
      )}

      {generatingPrompts && (
        <div className="text-center py-6">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-base text-muted-foreground">
            Generating variation prompts...
          </p>
        </div>
      )}

      {error && (
        <Card className="p-6 border-destructive">
          <p className="text-destructive text-base">{error}</p>
          <Button
            onClick={generatePrompts}
            variant="outline"
            size="lg"
            className="mt-3"
          >
            Retry
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-[4/5] relative">
              {generatingImages[i] ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted p-8">
                  <GenProgress
                    active={true}
                    label={`Variation ${i + 1}`}
                  />
                </div>
              ) : variationImages[i] ? (
                <img
                  src={variationImages[i]!.url}
                  alt={`Variation ${i + 1}`}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setLightboxSrc(variationImages[i]!.url)}
                />
              ) : variationErrors[i] ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted p-4">
                  <div className="text-center">
                    <p className="text-sm text-destructive font-medium mb-3">
                      {variationErrors[i]}
                    </p>
                    <Button
                      onClick={() => {
                        setVariationErrors((prev) => {
                          const next = [...prev];
                          next[i] = null;
                          return next;
                        });
                        generateVariation(i, variationPrompts[i]);
                      }}
                      variant="outline"
                      size="default"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <p className="text-sm text-muted-foreground">Waiting...</p>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-sm font-medium mb-1">Variation {i + 1}</p>
              {variationPrompts[i] && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {variationPrompts[i]}
                </p>
              )}
              {variationImages[i] && !generatingImages[i] && (
                <Button
                  onClick={() => generateVariation(i, variationPrompts[i])}
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                >
                  Regenerate
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleContinue} disabled={!allDone} size="lg">
          Select for Carousel
        </Button>
      </div>

      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/hooks/useWizardState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lightbox } from "@/components/wizard/Lightbox";
import { GenProgress } from "@/components/wizard/GenProgress";

export default function Step2Hero() {
  const router = useRouter();
  const {
    sessionId,
    referenceImages,
    idea,
    heroImage,
    setHeroImage,
    setStep,
    addGenTime,
    addUsage,
  } = useWizardStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const startTime = useRef<number>(0);

  const generateHero = async () => {
    setLoading(true);
    setError(null);
    setHeroImage(null);
    startTime.current = Date.now();

    try {
      const res = await fetch("/api/gemini/generate-hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceImages, idea, sessionId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addGenTime(Date.now() - startTime.current);
      if (data.usage) addUsage(data.usage);
      setHeroImage({
        url: data.imageUrl,
        description: data.description,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!heroImage && referenceImages.length > 0 && !loading) {
      generateHero();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = () => {
    setStep(3);
    router.push("/wizard/step-3-variations");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-3">Hero Image</h2>
        <p className="text-lg text-muted-foreground">
          Review the generated hero image. Approve it or regenerate.
        </p>
      </div>

      {loading && (
        <Card className="flex items-center justify-center aspect-[4/5] max-w-lg mx-auto p-10">
          <div className="w-full space-y-6">
            <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <GenProgress active={loading} label="Generating hero image..." />
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-8 border-destructive">
          <p className="text-destructive text-lg font-medium mb-4">{error}</p>
          <Button onClick={generateHero} variant="outline" size="lg">
            Try Again
          </Button>
        </Card>
      )}

      {heroImage && !loading && (
        <div className="space-y-6">
          <Card
            className="overflow-hidden max-w-lg mx-auto cursor-zoom-in"
            onClick={() => setLightbox(true)}
          >
            <img
              src={heroImage.url}
              alt="Hero"
              className="w-full aspect-[4/5] object-cover"
            />
          </Card>

          {heroImage.description && (
            <p className="text-base text-muted-foreground text-center max-w-lg mx-auto">
              {heroImage.description}
            </p>
          )}

          <div className="flex justify-center gap-4">
            <Button onClick={generateHero} variant="outline" size="lg">
              Regenerate
            </Button>
            <Button onClick={handleApprove} size="lg">
              Approve & Continue
            </Button>
          </div>
        </div>
      )}

      {!heroImage && !loading && !error && (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-6">
            No reference images found. Go back and upload some.
          </p>
          <Button
            onClick={() => router.push("/wizard/step-1-upload")}
            variant="outline"
            size="lg"
          >
            Back to Upload
          </Button>
        </div>
      )}

      {lightbox && heroImage && (
        <Lightbox
          src={heroImage.url}
          alt="Hero"
          onClose={() => setLightbox(false)}
        />
      )}
    </div>
  );
}

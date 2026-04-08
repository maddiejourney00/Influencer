"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useWizardStore } from "@/hooks/useWizardState";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Step1Upload() {
  const router = useRouter();
  const { referenceImages, setReferenceImages, idea, setIdea, startNewHero } =
    useWizardStore();
  const [images, setImages] = useState<string[]>(referenceImages);
  const [ideaText, setIdeaText] = useState(idea);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const remaining = 6 - images.length;
      const filesToProcess = acceptedFiles.slice(0, remaining);
      const newDataUrls = await Promise.all(filesToProcess.map(fileToDataUrl));
      setImages((prev) => [...prev, ...newDataUrls].slice(0, 6));
    },
    [images.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 6 - images.length,
    disabled: images.length >= 6,
  });

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const canProceed = images.length >= 1 && ideaText.trim().length > 0;

  const handleNext = () => {
    setReferenceImages(images);
    setIdea(ideaText);
    startNewHero();
    router.push("/wizard/step-2-hero");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-3">Reference Images & Idea</h2>
        <p className="text-lg text-muted-foreground">
          Upload up to 6 reference images and describe your content idea.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : images.length >= 6
              ? "border-muted cursor-not-allowed opacity-50"
              : "border-border hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-lg text-primary">Drop images here...</p>
        ) : images.length >= 6 ? (
          <p className="text-lg text-muted-foreground">Maximum 6 images reached</p>
        ) : (
          <div className="space-y-3">
            <p className="text-lg font-medium">
              Drag & drop reference images here, or click to browse
            </p>
            <p className="text-base text-muted-foreground">
              {images.length}/6 images uploaded. PNG, JPG, or WebP.
            </p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {images.map((img, i) => (
            <Card key={i} className="relative group overflow-hidden aspect-[4/5]">
              <img
                src={img}
                alt={`Reference ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-2 right-2 w-8 h-8 bg-black/70 text-white rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                X
              </button>
            </Card>
          ))}
        </div>
      )}

      <div>
        <label className="block text-base font-medium mb-3">Content Idea</label>
        <Textarea
          placeholder="Describe your content idea... e.g., 'Cozy autumn coffee shop vibes with warm lighting and vintage aesthetics'"
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value)}
          rows={4}
          className="text-base"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!canProceed} size="lg" className="text-base px-8">
          Generate Hero Image
        </Button>
      </div>
    </div>
  );
}

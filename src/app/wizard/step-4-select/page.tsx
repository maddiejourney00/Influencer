"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/hooks/useWizardState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Lightbox } from "@/components/wizard/Lightbox";
import { cn } from "@/lib/utils";

export default function Step4Select() {
  const router = useRouter();
  const {
    heroImage,
    variationImages,
    selectedForCarousel,
    setSelectedForCarousel,
    caption,
    setCaption,
    reset,
  } = useWizardStore();

  const [selected, setSelected] = useState<number[]>(
    selectedForCarousel.length > 0 ? selectedForCarousel : [0]
  );
  const [captionText, setCaptionText] = useState(caption);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const allImages = [heroImage, ...variationImages].filter(Boolean);

  const toggleSelection = (index: number) => {
    setSelected((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleFinish = () => {
    setSelectedForCarousel(selected);
    setCaption(captionText);
    alert(
      `Selected ${selected.length} images for carousel.\n\nCaption: ${captionText}\n\nInstagram posting & Google Drive backup coming soon!`
    );
  };

  const handleNewBatch = () => {
    reset();
    router.push("/wizard/step-1-upload");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-3">Select Carousel Images</h2>
        <p className="text-lg text-muted-foreground">
          Click to select/deselect. Double-click or hit View to preview.
          Selected: {selected.length}/5
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
        {allImages.map((img, i) => (
          <Card
            key={i}
            className={cn(
              "overflow-hidden cursor-pointer transition-all",
              selected.includes(i)
                ? "ring-3 ring-primary"
                : "opacity-60 hover:opacity-80"
            )}
            onClick={() => toggleSelection(i)}
          >
            <div className="aspect-[4/5] relative">
              <img
                src={img!.url}
                alt={i === 0 ? "Hero" : `Variation ${i}`}
                className="w-full h-full object-cover"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setLightboxSrc(img!.url);
                }}
              />
              <div className="absolute top-2 left-2">
                <Checkbox
                  checked={selected.includes(i)}
                  className="bg-white/80 w-5 h-5"
                />
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-black/60 px-3 py-2 flex justify-between items-center">
                <p className="text-white text-sm font-medium">
                  {i === 0 ? "Hero" : `Var ${i}`}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxSrc(img!.url);
                  }}
                  className="text-white/70 hover:text-white text-sm"
                >
                  View
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <label className="block text-base font-medium mb-3">
          Caption{" "}
          <span className="text-muted-foreground font-normal">
            ({captionText.length}/2200)
          </span>
        </label>
        <Textarea
          placeholder="Write your Instagram caption..."
          value={captionText}
          onChange={(e) => setCaptionText(e.target.value)}
          rows={4}
          maxLength={2200}
          className="text-base"
        />
      </div>

      <div className="flex justify-between">
        <div className="flex gap-3">
          <Button onClick={handleNewBatch} variant="outline" size="lg" className="text-base">
            New Batch
          </Button>
          <Button
            onClick={() => router.push("/gallery")}
            variant="ghost"
            size="lg"
            className="text-base"
          >
            Gallery
          </Button>
        </div>
        <Button
          onClick={handleFinish}
          disabled={selected.length < 2}
          size="lg"
          className="text-base px-8"
        >
          Finish ({selected.length} images)
        </Button>
      </div>

      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}

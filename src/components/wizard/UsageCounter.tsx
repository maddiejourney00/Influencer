"use client";

import { useWizardStore } from "@/hooks/useWizardState";

// Nano Banana 2 / gemini-3.1-flash-image-preview pricing
// Per-image cost at 2K resolution: $0.101
// Text prompt tokens are negligible compared to image cost
const IMAGE_COST_2K = 0.101; // $0.101 per generated image at 2K

function formatCost(cost: number) {
  if (cost === 0) return "$0.00";
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function UsageCounter() {
  const { sessionUsage, totalUsage } = useWizardStore();

  const sessionCost = sessionUsage.imageCount * IMAGE_COST_2K;
  const totalCost = totalUsage.imageCount * IMAGE_COST_2K;

  if (totalUsage.totalTokens === 0 && totalUsage.imageCount === 0) return null;

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1.5" title={`${formatTokens(sessionUsage.totalTokens)} tokens`}>
        <span className="font-medium">Session:</span>
        <span>{sessionUsage.imageCount} imgs</span>
        <span className="text-foreground font-semibold">{formatCost(sessionCost)}</span>
      </div>
      <span className="text-border">|</span>
      <div className="flex items-center gap-1.5" title={`${formatTokens(totalUsage.totalTokens)} tokens`}>
        <span className="font-medium">Total:</span>
        <span>{totalUsage.imageCount} imgs</span>
        <span className="text-foreground font-semibold">{formatCost(totalCost)}</span>
      </div>
    </div>
  );
}
